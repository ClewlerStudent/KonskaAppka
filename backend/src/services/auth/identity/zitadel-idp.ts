import type { CodeChannel } from '../../../contracts/common.js';
import type { Contact, ContactKind } from '../contact.js';
import type {
  CheckOtpResult,
  CreateSessionResult,
  CreateUserInput,
  CreateUserResult,
  IdentityProvider,
  IdpSession,
  IdpUser,
} from './identity-provider.js';

/**
 * Szkielet adaptera ZITADEL (self-hosted, API v2 w klastrze, konto serwisowe auth
 * z kluczem prywatnym JWT). Zakres i ustalenia: docs/mikroserwisy.md 3.1, 5.2 („Kody”), 5.10;
 * do potwierdzenia w spike'u 11.4 pkt 1. Kody zawsze z `return_code`/`returnCode`:
 * ZITADEL niczego nie wysyła, kody wysyła auth (W7).
 *
 * TODO(spike 11.4 pkt 1): klient API v2 (UserService, SessionService), uwierzytelnienie
 * kontem serwisowym, organizacja klientów (`identity_pool = customer`), testy kontraktowe
 * na lokalnym ZITADEL z compose.
 */

export class NotImplementedError extends Error {
  constructor(what: string) {
    super(`ZITADEL adapter not implemented: ${what} (spike 11.4 pkt 1)`);
    this.name = 'NotImplementedError';
  }
}

export interface ZitadelConfig {
  readonly apiUrl: string;
  readonly serviceKeyFile: string;
}

export class ZitadelIdentityProvider implements IdentityProvider {
  constructor(readonly config: ZitadelConfig) {}

  /** UserService.CreateUser (human): username = userId, hasło, e-mail albo telefon z `return_code`. */
  createUser(_input: CreateUserInput): Promise<CreateUserResult> {
    return Promise.reject(new NotImplementedError('CreateUser'));
  }

  /** UserService.ListUsers z filtrem e-maila albo telefonu w organizacji klientów. */
  findUserByContact(_contact: Contact): Promise<IdpUser | null> {
    return Promise.reject(new NotImplementedError('ListUsers'));
  }

  /** UserService.GetUserByID: kontakty z flagą weryfikacji, stan konta, metody OTP. */
  getUser(_idpUserId: string): Promise<IdpUser | null> {
    return Promise.reject(new NotImplementedError('GetUserByID'));
  }

  /** UserService.DeleteUser (brak konta to sukces). */
  deleteUser(_idpUserId: string): Promise<void> {
    return Promise.reject(new NotImplementedError('DeleteUser'));
  }

  /** UserService.VerifyEmail albo VerifyPhone. */
  verifyContact(
    _idpUserId: string,
    _kind: ContactKind,
    _code: string,
  ): Promise<'ok' | 'invalid_code'> {
    return Promise.reject(new NotImplementedError('VerifyEmail/VerifyPhone'));
  }

  /** UserService.ResendEmailCode albo ResendPhoneCode z `return_code`. */
  resendVerificationCode(_idpUserId: string, _kind: ContactKind): Promise<string | null> {
    return Promise.reject(new NotImplementedError('ResendEmailCode/ResendPhoneCode'));
  }

  /** UserService.AddOTPEmail albo AddOTPSMS. */
  addOtp(_idpUserId: string, _channel: CodeChannel): Promise<void> {
    return Promise.reject(new NotImplementedError('AddOTPEmail/AddOTPSMS'));
  }

  /** SessionService.CreateSession z `checks.user` i `checks.password`, `lifetime` 5 min. */
  createSession(_input: { idpUserId: string; password: string }): Promise<CreateSessionResult> {
    return Promise.reject(new NotImplementedError('CreateSession'));
  }

  /** SessionService.SetSession z wyzwaniem `otpEmail` albo `otpSms` i `returnCode`. */
  requestOtp(_sessionId: string, _channel: CodeChannel): Promise<string> {
    return Promise.reject(new NotImplementedError('SetSession challenge'));
  }

  /** SessionService.SetSession z `checks.otpEmail` albo `checks.otpSms`. */
  checkOtp(_sessionId: string, _code: string): Promise<CheckOtpResult> {
    return Promise.reject(new NotImplementedError('SetSession checks'));
  }

  /** SessionService.GetSession: użytkownik i sprawdzone czynniki. */
  getSession(_sessionId: string): Promise<IdpSession | null> {
    return Promise.reject(new NotImplementedError('GetSession'));
  }

  /** SessionService.DeleteSession. */
  deleteSession(_sessionId: string): Promise<void> {
    return Promise.reject(new NotImplementedError('DeleteSession'));
  }
}
