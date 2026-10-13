import { readFileSync } from 'node:fs';

// Ostatnie wiadomości ze skrzynki dev (kody, które auth „wysłał” SMS-em albo e-mailem).
// Użycie: npm run dev:inbox [-- liczba]
interface InboxEntry {
  at: string;
  channel: string;
  to: string;
  purpose: string;
  code?: string;
  body: string;
}

const file = process.env.DEV_INBOX_FILE ?? '.local/inbox.jsonl';
const count = Number(process.argv[2] ?? 5);

let lines: string[] = [];
try {
  lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);
} catch {
  console.log(`Skrzynka ${file} jest pusta.`);
}

for (const line of lines.slice(-count)) {
  const m = JSON.parse(line) as InboxEntry;
  console.log(
    `${m.at}  ${m.channel.padEnd(5)}  ${m.to}  ${m.purpose}  ${m.code ?? ''}\n  ${m.body}`,
  );
}
