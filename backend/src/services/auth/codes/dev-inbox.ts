import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Clock } from '../../../kit/clock.js';
import type { CodeSender } from './code-sender.js';

/**
 * Skrzynka dev: każda wiadomość to linia JSONL w pliku (npm run dev:inbox, E2E).
 * Tylko poza prod (env.ts blokuje CODE_SENDER=dev-inbox przy APP_ENV=prod).
 */
export function createDevInboxCodeSender(file: string, clock: Clock): CodeSender {
  let ready: Promise<unknown> | null = null;
  return {
    async send(message) {
      ready ??= mkdir(dirname(file), { recursive: true });
      await ready;
      const entry = { ...message, at: clock.now().toISOString() };
      await appendFile(file, `${JSON.stringify(entry)}\n`, { mode: 0o600 });
    },
  };
}
