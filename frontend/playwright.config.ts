import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

// E2E: backend auth (FAKE IdP, skrzynka dev w pliku), panel i www na portach E2E.
// Wymaga `npm ci` w backend/ i frontend/. Przeglądarki: PLAYWRIGHT_BROWSERS_PATH (bez playwright install).
// Testy biorą adresy, hasło kont demo i ścieżkę skrzynki z env E2E_* (nie importują tego pliku).
const ports = { auth: 4110, jwks: 4111, web: 5273, www: 5274 };
const e2eUrls = {
  web: `http://localhost:${ports.web}`,
  www: `http://localhost:${ports.www}`,
};

const tmpDir = fileURLToPath(new URL('./e2e/.tmp/', import.meta.url));
const inboxFile = `${tmpDir}inbox.jsonl`;

// Konfigurację ładuje też każdy worker: skrzynkę czyści tylko proces główny, a hasło
// kont demo workery dziedziczą w env.
if (process.env.TEST_WORKER_INDEX === undefined) {
  mkdirSync(tmpDir, { recursive: true });
  writeFileSync(inboxFile, '');
}
const demoPassword = (process.env.E2E_DEMO_PASSWORD ??= randomBytes(12).toString('base64url'));
process.env.E2E_INBOX_FILE = inboxFile;
process.env.E2E_WEB_URL = e2eUrls.web;
process.env.E2E_WWW_URL = e2eUrls.www;

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'line' : 'list',
  use: { trace: 'retain-on-failure' },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'phone',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: [
    {
      command: 'npm --prefix ../backend run serve:auth',
      url: `http://127.0.0.1:${ports.auth}/livez`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        APP_ENV: 'test',
        LOG_LEVEL: 'warn',
        HOST: '127.0.0.1',
        PORT: String(ports.auth),
        JWKS_PORT: String(ports.jwks),
        AUTH_ISSUER: `http://localhost:${ports.auth}/auth/v1`,
        ALLOWED_ORIGINS: e2eUrls.web,
        SIGNING_KEY_EPHEMERAL: 'true',
        IDP: 'fake',
        CODE_SENDER: 'dev-inbox',
        DEV_INBOX_FILE: inboxFile,
        DEV_DEMO_PASSWORD: demoPassword,
        // Damian loguje się w E2E kilkanaście razy w 15 minut z jednego IP (limit: 10 na login).
        RATE_LIMIT_FACTOR: '10',
      },
    },
    {
      command: `npm run dev:web -- --port ${ports.web} --strictPort`,
      url: e2eUrls.web,
      reuseExistingServer: false,
      env: {
        AUTH_PROXY_TARGET: `http://127.0.0.1:${ports.auth}`,
        VITE_WWW_URL: e2eUrls.www,
      },
    },
    {
      command: `npm run dev:www -- --port ${ports.www} --strictPort`,
      url: e2eUrls.www,
      reuseExistingServer: false,
      env: { VITE_PANEL_URL: e2eUrls.web },
    },
  ],
});
