import type { CodeChannel } from '../../contracts/common.js';
import { ApiError } from '../../kit/problem.js';

/** Login z treści żądania po normalizacji: e-mail albo telefon E.164. */
export type ContactKind = 'email' | 'phone';

export interface Contact {
  readonly kind: ContactKind;
  readonly value: string;
}

const E164_RE = /^\+[1-9]\d{7,14}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;

/**
 * Login z `@` to e-mail (trim, małe litery), inaczej telefon: bez spacji i myślników,
 * 9 cyfr dostaje +48, wynik musi być w E.164. Zły format: null.
 */
export function normalizeLogin(raw: string): Contact | null {
  const trimmed = raw.trim();
  if (trimmed.includes('@')) {
    const email = trimmed.toLowerCase();
    return email.length <= MAX_EMAIL && EMAIL_RE.test(email)
      ? { kind: 'email', value: email }
      : null;
  }
  let phone = trimmed.replace(/[\s-]/g, '');
  if (/^\d{9}$/.test(phone)) phone = `+48${phone}`;
  return E164_RE.test(phone) ? { kind: 'phone', value: phone } : null;
}

/** Jak normalizeLogin, ale zły format daje 400 validation_failed (bez wartości w odpowiedzi). */
export function requireContact(raw: string): Contact {
  const contact = normalizeLogin(raw);
  if (!contact) {
    throw new ApiError('validation_failed', {
      errors: [{ path: 'body.login', message: 'Expected an e-mail address or a phone number' }],
    });
  }
  return contact;
}

/** Klucz limitu żądań `login`: ten sam dla różnych zapisów jednego kontaktu. */
export function loginRateKey(raw: string): string {
  return normalizeLogin(raw)?.value ?? raw.trim().toLowerCase();
}

export function channelFor(kind: ContactKind): CodeChannel {
  return kind === 'phone' ? 'sms' : 'email';
}

export function kindFor(channel: CodeChannel): ContactKind {
  return channel === 'sms' ? 'phone' : 'email';
}

const COUNTRY_CODES = ['380', '48'];

/** `+48602000145` → `+48 602 *** 145` (kierunkowy, 3 pierwsze cyfry, ***, 3 ostatnie). */
export function maskPhone(e164: string): string {
  const digits = e164.slice(1);
  const cc = COUNTRY_CODES.find((code) => digits.startsWith(code)) ?? digits.slice(0, 2);
  const national = digits.slice(cc.length);
  return `+${cc} ${national.slice(0, 3)} *** ${national.slice(-3)}`;
}

/** `damian@stajnielipowe.pl` → `d•••@stajnielipowe.pl`. */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf('@');
  return `${email.slice(0, 1)}•••${email.slice(at)}`;
}

export function maskContact(contact: Contact): string {
  return contact.kind === 'phone' ? maskPhone(contact.value) : maskEmail(contact.value);
}
