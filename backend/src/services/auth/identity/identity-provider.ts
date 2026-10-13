import type { CodeChannel, Locale } from '../../../contracts/common.js';
import type { Contact, ContactKind } from '../contact.js';

/**
 * Dostawca tożsamości za auth (docs/mikroserwisy.md 3.1, 5.2). Kształt jak API ZITADEL v2
 * (konta, sesje, wyzwania z `returnCode`), żeby adapter ZITADEL był mechaniczny.
 * Kody generuje i sprawdza dostawca, ale zwraca je do auth, a auth je wysyła (W7).
 */

export interface IdpContact<T> {
  readonly value: T;
  readonly verified: boolean;
}

export interface IdpUser {
  /** Id konta u dostawcy (`users.idp_user_id`). */
  readonly id: string;
  /** `username` u dostawcy = `users.id` nadany przez auth przy rejestracji. */
  readonly username: string;
  readonly displayName: string;
  readonly locale: Locale;
  readonly email: IdpContact<string> | null;
  readonly phone: IdpContact<string> | null;
  /** Kanał kodu MFA (dokładnie jedna metoda OTP); null = konto niepotwierdzone. */
  readonly otpChannel: CodeChannel | null;
  readonly locked: boolean;
}

export interface IdpSession {
  readonly id: string;
  readonly idpUserId: string;
  readonly passwordChecked: boolean;
  readonly otpChecked: boolean;
}

export interface CreateUserInput {
  readonly userId: string;
  readonly contact: Contact;
  readonly password: string;
  readonly displayName: string;
  readonly locale: Locale;
}

export type CreateUserResult =
  { readonly idpUserId: string; readonly verificationCode: string } | 'weak_password';

export type CreateSessionResult = { readonly sessionId: string } | 'invalid_credentials' | 'locked';

export type CheckOtpResult = 'ok' | 'invalid_code' | 'locked' | 'no_session';

export interface IdentityProvider {
  /** Konto z hasłem i kontaktem (niezweryfikowanym); kod weryfikacyjny wraca do auth. */
  createUser(input: CreateUserInput): Promise<CreateUserResult>;
  /** Konto po kontakcie; konto ze zweryfikowanym kontaktem ma pierwszeństwo. */
  findUserByContact(contact: Contact): Promise<IdpUser | null>;
  getUser(idpUserId: string): Promise<IdpUser | null>;
  deleteUser(idpUserId: string): Promise<void>;
  verifyContact(idpUserId: string, kind: ContactKind, code: string): Promise<'ok' | 'invalid_code'>;
  /** Nowy kod weryfikacyjny; null, gdy kontakt jest już zweryfikowany albo go nie ma. */
  resendVerificationCode(idpUserId: string, kind: ContactKind): Promise<string | null>;
  /** Kanał kodu MFA (tylko zweryfikowany kontakt). */
  addOtp(idpUserId: string, channel: CodeChannel): Promise<void>;
  /** Sesja ze sprawdzeniem hasła; konto zablokowane daje `locked` bez sprawdzenia hasła. */
  createSession(input: { idpUserId: string; password: string }): Promise<CreateSessionResult>;
  /** Wyzwanie OTP w sesji (po haśle); nowy kod unieważnia poprzedni. */
  requestOtp(sessionId: string, channel: CodeChannel): Promise<string>;
  checkOtp(sessionId: string, code: string): Promise<CheckOtpResult>;
  getSession(sessionId: string): Promise<IdpSession | null>;
  deleteSession(sessionId: string): Promise<void>;
}

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 256;
export const MFA_CODE_DIGITS = 6;
export const MFA_CODE_TTL_S = 300;
export const VERIFY_CODE_DIGITS = 8;
export const VERIFY_CODE_TTL_S = 900;
export const MAX_OTP_ATTEMPTS = 5;
export const IDP_SESSION_TTL_S = 300;

export function isContactVerified(user: IdpUser, contact: Contact): boolean {
  const own = contact.kind === 'phone' ? user.phone : user.email;
  return own?.value === contact.value && own.verified;
}

export function hasVerifiedContact(user: IdpUser): boolean {
  return Boolean(user.phone?.verified || user.email?.verified);
}

/** Zweryfikowany kontakt kanału kodu MFA albo null. */
export function otpTarget(user: IdpUser): Contact | null {
  if (user.otpChannel === 'sms' && user.phone?.verified) {
    return { kind: 'phone', value: user.phone.value };
  }
  if (user.otpChannel === 'email' && user.email?.verified) {
    return { kind: 'email', value: user.email.value };
  }
  return null;
}
