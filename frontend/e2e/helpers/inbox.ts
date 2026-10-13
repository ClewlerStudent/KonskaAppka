import { existsSync, readFileSync } from 'node:fs';
import { expect } from '@playwright/test';

/** Wiadomość ze skrzynki dev backendu (CODE_SENDER=dev-inbox, plik JSONL). */
export interface InboxMessage {
  id: string;
  at: string;
  channel: 'sms' | 'email';
  to: string;
  subject?: string;
  body: string;
  purpose: 'verify' | 'mfa' | 'existing_account';
  code?: string;
}

export function readInbox(file: string): InboxMessage[] {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as InboxMessage);
}

/** Ostatni kod wysłany na adres `to` po chwili `after` (ms); czeka do 10 s. */
export async function waitForCode(
  file: string,
  { to, purpose, after }: { to: string; purpose: InboxMessage['purpose']; after: number },
): Promise<{ code: string; channel: InboxMessage['channel'] }> {
  let found: InboxMessage | undefined;
  await expect
    .poll(
      () => {
        found = readInbox(file)
          .filter((m) => m.to === to && m.purpose === purpose && Date.parse(m.at) >= after)
          .at(-1);
        return found?.code;
      },
      { message: `kod ${purpose} dla ${to}`, timeout: 10_000 },
    )
    .toBeTruthy();
  return { code: found!.code!, channel: found!.channel };
}
