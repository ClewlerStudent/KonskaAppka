import createClient from 'openapi-fetch';
import type { paths } from './auth';

// Typy tras z backend/openapi/auth.json (npm run gen:api); plik auth.d.ts jest commitowany,
// żeby frontend dało się zbudować bez katalogu backend/.
export type AuthPaths = paths;
export type { components as AuthComponents } from './auth';

/** Klient tras /auth/v1; pusty baseUrl = ten sam origin. Zawsze z ciasteczkami. */
export function createAuthClient(baseUrl: string, fetchImpl?: typeof fetch) {
  return createClient<paths>({
    baseUrl,
    credentials: 'include',
    ...(fetchImpl ? { fetch: fetchImpl } : {}),
  });
}

export type AuthClient = ReturnType<typeof createAuthClient>;
