import type { FailureCode } from '../../src/api/auth-api';

/** Komunikaty błędów (PL). Kod spoza listy dostaje komunikat ogólny. */
export const messages = {
  invalidCredentials: 'Nieprawidłowy numer, e-mail lub hasło.',
  accountLocked: 'Konto zablokowane po zbyt wielu błędnych kodach. Użyj „Nie pamiętam hasła”.',
  rateLimited: 'Za dużo prób. Spróbuj ponownie za chwilę.',
  invalidLoginCode: 'Nieprawidłowy kod. Spróbuj jeszcze raz.',
  invalidSignUpCode: 'Nieprawidłowy kod.',
  loginExpired: 'Kod wygasł. Zaloguj się ponownie.',
  weakPassword: 'Hasło musi mieć co najmniej 10 znaków.',
  validation: 'Sprawdź wpisane dane.',
  network: 'Brak połączenia z serwerem. Spróbuj ponownie.',
  generic: 'Coś poszło nie tak. Spróbuj ponownie.',
  phoneRequired: 'Wpisz 9 cyfr numeru telefonu.',
  emailRequired: 'Wpisz adres e-mail.',
  passwordRequired: 'Wpisz hasło.',
  nameRequired: 'Wpisz imię i nazwisko.',
  codeIncomplete: 'Wpisz wszystkie cyfry kodu.',
} as const;

export type ErrorContext = 'login' | 'loginCode' | 'signUp' | 'signUpCode';

export function errorMessage(code: FailureCode, context: ErrorContext): string {
  switch (code) {
    case 'invalid_credentials':
      return messages.invalidCredentials;
    case 'account_locked':
      return messages.accountLocked;
    case 'rate_limited':
      return messages.rateLimited;
    case 'invalid_code':
      return context === 'signUpCode' ? messages.invalidSignUpCode : messages.invalidLoginCode;
    case 'invalid_token':
      return context === 'loginCode' ? messages.loginExpired : messages.generic;
    case 'weak_password':
      return messages.weakPassword;
    case 'validation_failed':
      return messages.validation;
    case 'network_error':
      return messages.network;
    default:
      return messages.generic;
  }
}
