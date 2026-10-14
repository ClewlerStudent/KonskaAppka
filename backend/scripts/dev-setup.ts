import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

// Lokalne sekrety dev w backend/.local/ (poza gitem): klucz podpisu ES256, dev.env
// i masterkey ZITADEL (profil infra w docker-compose.yml).
// Istniejących plików nie nadpisuje. Produkcja dostaje klucz z SIGNING_KEY_FILE albo SIGNING_KEY_PEM.
const dir = new URL('../.local/', import.meta.url);
const keyFile = new URL('signing-key.pem', dir);
const envFile = new URL('dev.env', dir);
const masterkeyFile = new URL('zitadel-masterkey', dir);

mkdirSync(dir, { recursive: true, mode: 0o700 });

if (existsSync(keyFile)) {
  console.log('.local/signing-key.pem już jest');
} else {
  const { privateKey } = generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  writeFileSync(keyFile, privateKey, { mode: 0o600 });
  console.log('Utworzono .local/signing-key.pem (ES256, P-256)');
}

if (existsSync(envFile)) {
  console.log('.local/dev.env już jest (hasło kont demo: DEV_DEMO_PASSWORD w tym pliku)');
} else {
  const password = randomBytes(12).toString('base64url');
  const env = [
    'APP_ENV=dev',
    'LOG_LEVEL=info',
    'LOG_PRETTY=true',
    'HOST=127.0.0.1',
    'PORT=4010',
    'JWKS_PORT=4011',
    'AUTH_ISSUER=http://localhost:4010/auth/v1',
    'ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174',
    'SIGNING_KEY_FILE=.local/signing-key.pem',
    'IDP=fake',
    'CODE_SENDER=dev-inbox',
    'DEV_INBOX_FILE=.local/inbox.jsonl',
    `DEV_DEMO_PASSWORD=${password}`,
    '',
  ].join('\n');
  writeFileSync(envFile, env, { mode: 0o600 });
  console.log('Utworzono .local/dev.env');
  console.log(`Hasło kont demo (DEV_DEMO_PASSWORD): ${password}`);
}

if (existsSync(masterkeyFile)) {
  console.log('.local/zitadel-masterkey już jest');
} else {
  // ZITADEL wymaga dokładnie 32 znaków; base64url z 24 bajtów daje 32.
  writeFileSync(masterkeyFile, randomBytes(24).toString('base64url'), { mode: 0o600 });
  console.log('Utworzono .local/zitadel-masterkey (32 znaki)');
}

console.log('Konta demo: README.md, sekcja „Konta demo”. Start: npm run dev:auth');
