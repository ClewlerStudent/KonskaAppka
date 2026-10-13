import { randomBytes, randomInt, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { CodeChannel, Locale } from '../../../contracts/common.js';
import type { Clock } from '../../../kit/clock.js';
import { kindFor, type Contact, type ContactKind } from '../contact.js';
import {
  IDP_SESSION_TTL_S,
  MAX_OTP_ATTEMPTS,
  MFA_CODE_DIGITS,
  MFA_CODE_TTL_S,
  PASSWORD_MAX,
  PASSWORD_MIN,
  VERIFY_CODE_DIGITS,
  VERIFY_CODE_TTL_S,
  type CheckOtpResult,
  type CreateSessionResult,
  type CreateUserInput,
  type CreateUserResult,
  type IdentityProvider,
  type IdpSession,
  type IdpUser,
} from './identity-provider.js';

/**
 * Fałszywy dostawca tożsamości dla dev i testów (start w prod zablokowany w env.ts):
 * dane w pamięci procesu, hasła jako skróty scrypt, kody z crypto.randomInt,
 * wygasanie według wstrzykniętego zegara. Zachowanie jak ustawienia ZITADEL z docs:
 * blokada po 5 złych kodach MFA, bez blokady za hasło.
 */

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number },
) => Promise<Buffer>;
const SCRYPT_N = 2 ** 14;
const KEY_LEN = 32;

interface PendingCode {
  readonly code: string;
  readonly expiresAt: number;
}

interface StoredContact {
  value: string;
  verified: boolean;
  verification: PendingCode | null;
}

interface StoredUser {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
  readonly locale: Locale;
  readonly salt: Buffer;
  readonly hash: Buffer;
  readonly contacts: Partial<Record<ContactKind, StoredContact>>;
  otpChannel: CodeChannel | null;
  failedOtp: number;
  locked: boolean;
}

interface StoredSession {
  readonly id: string;
  readonly idpUserId: string;
  readonly expiresAt: number;
  otp: PendingCode | null;
  otpChecked: boolean;
}

export interface VerifiedUserInput {
  readonly username: string;
  readonly displayName: string;
  readonly locale: Locale;
  readonly password: string;
  readonly phone?: string;
  readonly email?: string;
  readonly otpChannel: CodeChannel;
}

function generateCode(digits: number): string {
  return randomInt(0, 10 ** digits)
    .toString()
    .padStart(digits, '0');
}

function sameCode(expected: string, given: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export class FakeIdentityProvider implements IdentityProvider {
  private readonly users = new Map<string, StoredUser>();
  private readonly sessions = new Map<string, StoredSession>();

  constructor(private readonly clock: Clock) {}

  private now(): number {
    return this.clock.now().getTime();
  }

  private async hash(password: string, salt: Buffer): Promise<Buffer> {
    return scryptAsync(password, salt, KEY_LEN, { N: SCRYPT_N });
  }

  private view(user: StoredUser): IdpUser {
    const contact = (kind: ContactKind) => {
      const stored = user.contacts[kind];
      return stored ? { value: stored.value, verified: stored.verified } : null;
    };
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      locale: user.locale,
      email: contact('email'),
      phone: contact('phone'),
      otpChannel: user.otpChannel,
      locked: user.locked,
    };
  }

  private liveSession(sessionId: string): StoredSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (session.expiresAt <= this.now()) {
      this.sessions.delete(sessionId);
      return null;
    }
    return session;
  }

  async createUser(input: CreateUserInput): Promise<CreateUserResult> {
    if (input.password.length < PASSWORD_MIN || input.password.length > PASSWORD_MAX) {
      return 'weak_password';
    }
    const salt = randomBytes(16);
    const verificationCode = generateCode(VERIFY_CODE_DIGITS);
    const user: StoredUser = {
      id: randomUUID(),
      username: input.userId,
      displayName: input.displayName,
      locale: input.locale,
      salt,
      hash: await this.hash(input.password, salt),
      contacts: {
        [input.contact.kind]: {
          value: input.contact.value,
          verified: false,
          verification: {
            code: verificationCode,
            expiresAt: this.now() + VERIFY_CODE_TTL_S * 1000,
          },
        },
      },
      otpChannel: null,
      failedOtp: 0,
      locked: false,
    };
    this.users.set(user.id, user);
    return { idpUserId: user.id, verificationCode };
  }

  /** Konto demo albo testowe z potwierdzonymi kontaktami i kanałem MFA. */
  async addVerifiedUser(input: VerifiedUserInput): Promise<IdpUser> {
    const salt = randomBytes(16);
    const contacts: StoredUser['contacts'] = {};
    if (input.phone) contacts.phone = { value: input.phone, verified: true, verification: null };
    if (input.email) contacts.email = { value: input.email, verified: true, verification: null };
    if (!contacts[kindFor(input.otpChannel)]) {
      throw new Error(`${input.username}: no contact for OTP channel ${input.otpChannel}`);
    }
    const user: StoredUser = {
      id: randomUUID(),
      username: input.username,
      displayName: input.displayName,
      locale: input.locale,
      salt,
      hash: await this.hash(input.password, salt),
      contacts,
      otpChannel: input.otpChannel,
      failedOtp: 0,
      locked: false,
    };
    this.users.set(user.id, user);
    return this.view(user);
  }

  findUserByContact(contact: Contact): Promise<IdpUser | null> {
    let found: StoredUser | null = null;
    for (const user of this.users.values()) {
      const stored = user.contacts[contact.kind];
      if (stored?.value !== contact.value) continue;
      if (stored.verified) return Promise.resolve(this.view(user));
      found ??= user;
    }
    return Promise.resolve(found ? this.view(found) : null);
  }

  getUser(idpUserId: string): Promise<IdpUser | null> {
    const user = this.users.get(idpUserId);
    return Promise.resolve(user ? this.view(user) : null);
  }

  deleteUser(idpUserId: string): Promise<void> {
    this.users.delete(idpUserId);
    for (const [id, session] of this.sessions) {
      if (session.idpUserId === idpUserId) this.sessions.delete(id);
    }
    return Promise.resolve();
  }

  verifyContact(
    idpUserId: string,
    kind: ContactKind,
    code: string,
  ): Promise<'ok' | 'invalid_code'> {
    const stored = this.users.get(idpUserId)?.contacts[kind];
    const pending = stored?.verification;
    if (!stored || stored.verified || !pending || pending.expiresAt <= this.now()) {
      return Promise.resolve('invalid_code');
    }
    if (!sameCode(pending.code, code)) return Promise.resolve('invalid_code');
    stored.verified = true;
    stored.verification = null;
    return Promise.resolve('ok');
  }

  resendVerificationCode(idpUserId: string, kind: ContactKind): Promise<string | null> {
    const stored = this.users.get(idpUserId)?.contacts[kind];
    if (!stored || stored.verified) return Promise.resolve(null);
    const code = generateCode(VERIFY_CODE_DIGITS);
    stored.verification = { code, expiresAt: this.now() + VERIFY_CODE_TTL_S * 1000 };
    return Promise.resolve(code);
  }

  addOtp(idpUserId: string, channel: CodeChannel): Promise<void> {
    const user = this.users.get(idpUserId);
    if (!user?.contacts[kindFor(channel)]?.verified) {
      return Promise.reject(new Error('OTP channel needs a verified contact'));
    }
    user.otpChannel = channel;
    return Promise.resolve();
  }

  async createSession(input: {
    idpUserId: string;
    password: string;
  }): Promise<CreateSessionResult> {
    const user = this.users.get(input.idpUserId);
    if (!user) return 'invalid_credentials';
    if (user.locked) return 'locked';
    const hash = await this.hash(input.password, user.salt);
    if (!timingSafeEqual(hash, user.hash)) return 'invalid_credentials';
    const session: StoredSession = {
      id: randomUUID(),
      idpUserId: user.id,
      expiresAt: this.now() + IDP_SESSION_TTL_S * 1000,
      otp: null,
      otpChecked: false,
    };
    this.sessions.set(session.id, session);
    return { sessionId: session.id };
  }

  requestOtp(sessionId: string, channel: CodeChannel): Promise<string> {
    const session = this.liveSession(sessionId);
    const user = session && this.users.get(session.idpUserId);
    if (!session || !user || user.otpChannel !== channel) {
      return Promise.reject(new Error('OTP challenge needs a live session and the user channel'));
    }
    const code = generateCode(MFA_CODE_DIGITS);
    session.otp = { code, expiresAt: this.now() + MFA_CODE_TTL_S * 1000 };
    session.otpChecked = false;
    return Promise.resolve(code);
  }

  checkOtp(sessionId: string, code: string): Promise<CheckOtpResult> {
    const session = this.liveSession(sessionId);
    const user = session && this.users.get(session.idpUserId);
    if (!session || !user) return Promise.resolve('no_session');
    if (user.locked) return Promise.resolve('locked');
    const pending = session.otp;
    if (!pending || pending.expiresAt <= this.now()) return Promise.resolve('invalid_code');
    if (!sameCode(pending.code, code)) {
      user.failedOtp += 1;
      if (user.failedOtp >= MAX_OTP_ATTEMPTS) {
        user.locked = true;
        return Promise.resolve('locked');
      }
      return Promise.resolve('invalid_code');
    }
    user.failedOtp = 0;
    session.otp = null;
    session.otpChecked = true;
    return Promise.resolve('ok');
  }

  getSession(sessionId: string): Promise<IdpSession | null> {
    const session = this.liveSession(sessionId);
    if (!session) return Promise.resolve(null);
    return Promise.resolve({
      id: session.id,
      idpUserId: session.idpUserId,
      // Sesja powstaje tylko po poprawnym haśle (createSession), jak CreateSession z checks.password.
      passwordChecked: true,
      otpChecked: session.otpChecked,
    });
  }

  deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    return Promise.resolve();
  }
}
