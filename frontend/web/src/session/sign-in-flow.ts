import type { CodeChannel } from '../../../src/api/auth-api';

/**
 * Stan między ekranami logowania i rejestracji, tylko w pamięci (bez danych osobowych w URL
 * i Web Storage). Hasła tu nie ma. Po przeładowaniu strony ekrany kodu wracają do formularza.
 */
export type LoginKind = 'phone' | 'email';

export interface LoginDraft {
  readonly kind: LoginKind;
  /** Numer krajowy tak, jak go wpisano (prefiks +48 jest stały). */
  readonly phone: string;
  readonly email: string;
}

export interface CodeTarget {
  readonly kind: LoginKind;
  readonly channel: CodeChannel;
  readonly maskedContact: string;
}

export interface MfaChallenge extends CodeTarget {
  readonly loginToken: string;
}

export interface PendingSignUp extends CodeTarget {
  /** Login po normalizacji, ten sam co w rejestracji. */
  readonly login: string;
}

/** Jednorazowe wskazówki dla ekranu logowania. */
export interface LoginHints {
  readonly accountConfirmed: boolean;
  readonly focusPassword: boolean;
}

export interface SignInFlow {
  draft(): LoginDraft;
  challenge(): MfaChallenge | null;
  pendingSignUp(): PendingSignUp | null;
  loginHints(): LoginHints;
  saveDraft(draft: LoginDraft): void;
  startMfa(challenge: MfaChallenge): void;
  startSignUpConfirmation(pending: PendingSignUp): void;
  /** Konto potwierdzone: logowanie z komunikatem i fokusem na haśle. */
  accountConfirmed(): void;
  /** Powrót z kroku kodu do hasła (login zostaje wpisany). */
  backToPassword(): void;
  clearLoginHints(): void;
  reset(): void;
}

const emptyDraft: LoginDraft = { kind: 'phone', phone: '', email: '' };
const noHints: LoginHints = { accountConfirmed: false, focusPassword: false };

export function createSignInFlow(): SignInFlow {
  let draft = emptyDraft;
  let challenge: MfaChallenge | null = null;
  let pendingSignUp: PendingSignUp | null = null;
  let hints = noHints;

  return {
    draft: () => draft,
    challenge: () => challenge,
    pendingSignUp: () => pendingSignUp,
    loginHints: () => hints,
    saveDraft(next) {
      draft = next;
    },
    startMfa(next) {
      challenge = next;
    },
    startSignUpConfirmation(next) {
      pendingSignUp = next;
    },
    accountConfirmed() {
      pendingSignUp = null;
      hints = { accountConfirmed: true, focusPassword: true };
    },
    backToPassword() {
      challenge = null;
      hints = { accountConfirmed: false, focusPassword: true };
    },
    clearLoginHints() {
      hints = noHints;
    },
    reset() {
      draft = emptyDraft;
      challenge = null;
      pendingSignUp = null;
      hints = noHints;
    },
  };
}

/** Cyfry numeru krajowego; „+48 602 000 145” i „602-000-145” dają „602000145”. */
export function nationalDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('48') ? digits.slice(2) : digits;
}

export type LoginValidation = { ok: true; login: string } | { ok: false; field: LoginKind };

/** Login wysyłany do auth: telefon jako +48 i 9 cyfr, e-mail bez spacji na brzegach. */
export function loginFromDraft(draft: LoginDraft): LoginValidation {
  if (draft.kind === 'phone') {
    const digits = nationalDigits(draft.phone);
    return digits.length === 9
      ? { ok: true, login: `+48${digits}` }
      : { ok: false, field: 'phone' };
  }
  const email = draft.email.trim();
  return /^[^\s@]+@[^\s@]+$/.test(email)
    ? { ok: true, login: email }
    : { ok: false, field: 'email' };
}
