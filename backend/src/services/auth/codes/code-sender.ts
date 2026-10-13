import type { CodeChannel } from '../../../contracts/common.js';

export type CodePurpose = 'verify' | 'mfa' | 'existing_account';

/** Gotowa wiadomość z kodem (W7): adres albo numer, treść, przy e-mailu temat. */
export interface CodeMessage {
  readonly id: string;
  readonly channel: CodeChannel;
  readonly to: string;
  readonly subject?: string;
  readonly body: string;
  readonly purpose: CodePurpose;
  /** Kod osobno tylko dla skrzynki dev i testów; kolejki `sms` i `email` go nie dostaną. */
  readonly code?: string;
}

/** Wysyłka kodów; docelowo kolejki SQS FIFO serwisów `sms` i `email`. */
export interface CodeSender {
  send(message: CodeMessage): Promise<void>;
}

/** Wysyłka do tablicy w pamięci (testy). */
export function createMemoryCodeSender(): CodeSender & { readonly messages: CodeMessage[] } {
  const messages: CodeMessage[] = [];
  return {
    messages,
    send(message) {
      messages.push(message);
      return Promise.resolve();
    },
  };
}
