import { v7 as uuidv7 } from 'uuid';
import type { Locale } from '../../../contracts/common.js';
import { channelFor, type Contact } from '../contact.js';
import type { CodeMessage } from './code-sender.js';

/**
 * Treści wiadomości z kodami. Na razie tylko po polsku; ukraiński i angielski dojdą
 * razem z kolejkami kodów (`locale` już przechodzi przez wywołania).
 */

function message(
  contact: Contact,
  purpose: CodeMessage['purpose'],
  subject: string,
  body: string,
  code?: string,
): CodeMessage {
  const channel = channelFor(contact.kind);
  return {
    id: uuidv7(),
    channel,
    to: contact.value,
    ...(channel === 'email' ? { subject } : {}),
    body,
    purpose,
    ...(code ? { code } : {}),
  };
}

export function mfaMessage(contact: Contact, _locale: Locale, code: string): CodeMessage {
  return message(
    contact,
    'mfa',
    'Kod logowania EQUENOR',
    `Kod logowania EQUENOR: ${code}. Ważny 5 minut. Nie podawaj go nikomu.`,
    code,
  );
}

export function verifyMessage(contact: Contact, _locale: Locale, code: string): CodeMessage {
  return message(
    contact,
    'verify',
    'Potwierdź konto EQUENOR',
    `Kod potwierdzenia konta EQUENOR: ${code}. Ważny 15 minut. Nie podawaj go nikomu.`,
    code,
  );
}

export function existingAccountMessage(contact: Contact, _locale: Locale): CodeMessage {
  const target = contact.kind === 'phone' ? 'ten numer' : 'ten adres';
  return message(
    contact,
    'existing_account',
    'Masz już konto EQUENOR',
    `Ktoś próbował założyć konto EQUENOR na ${target}, ale masz już konto. ` +
      'Zaloguj się albo użyj „Nie pamiętam hasła”. Jeśli to nie Ty, zignoruj tę wiadomość.',
  );
}
