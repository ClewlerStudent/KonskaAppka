import type { components } from './auth';
import { createAuthClient } from './client';

type Schemas = components['schemas'];

export type ErrorCode = Schemas['ErrorCode'];
export type CodeChannel = Schemas['CodeChannel'];
export type Locale = Schemas['Locale'];
export type CodeSentResponse = Schemas['CodeSentResponse'];
export type LoginResponse = Schemas['LoginResponse'];
export type TokenResponse = Schemas['TokenResponse'];
export type MeResponse = Schemas['MeResponse'];

/** Kod z problem+json albo błąd po stronie klienta (brak sieci, odpowiedź spoza kontraktu). */
export type FailureCode = ErrorCode | 'network_error' | 'unexpected_response';

export type ApiFailure = { ok: false; status: number; code: FailureCode };
export type ApiResult<T> = { ok: true; data: T } | ApiFailure;

export interface SignUpInput {
  login: string;
  password: string;
  displayName: string;
  locale: Locale;
}

/** Trasy /auth/v1 z perspektywy panelu web: clientId `web`, refresh token tylko w ciasteczku. */
export interface AuthApi {
  readonly signUp: (input: SignUpInput) => Promise<ApiResult<CodeSentResponse>>;
  readonly confirmSignUp: (login: string, code: string) => Promise<ApiResult<void>>;
  readonly resendSignUpCode: (login: string) => Promise<ApiResult<CodeSentResponse>>;
  readonly login: (login: string, password: string) => Promise<ApiResult<LoginResponse>>;
  readonly loginMfa: (loginToken: string, code: string) => Promise<ApiResult<TokenResponse>>;
  readonly refresh: () => Promise<ApiResult<TokenResponse>>;
  readonly logout: () => Promise<ApiResult<void>>;
  readonly getMe: (accessToken: string) => Promise<ApiResult<MeResponse>>;
}

/** Trasy otwarte wołane z przeglądarki wymagają tego nagłówka (wymusza preflight CORS). */
const webClient = { header: { 'x-equenor-client': 'web' as const } };

interface FetchOutcome<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

function problemCode(error: unknown): FailureCode {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error;
    if (typeof code === 'string' && code.length > 0) return code as ErrorCode;
  }
  return 'unexpected_response';
}

async function settle<T>(request: () => Promise<FetchOutcome<T>>): Promise<ApiResult<T>> {
  let outcome: FetchOutcome<T>;
  try {
    outcome = await request();
  } catch {
    return { ok: false, status: 0, code: 'network_error' };
  }
  const { response } = outcome;
  // Przy 2xx openapi-fetch daje treść zgodną ze schematem (204: undefined, czyli void).
  if (response.ok) return { ok: true, data: outcome.data as T };
  return { ok: false, status: response.status, code: problemCode(outcome.error) };
}

export function createAuthApi(baseUrl: string, fetchImpl?: typeof fetch): AuthApi {
  const client = createAuthClient(baseUrl, fetchImpl);

  return {
    signUp: (input) =>
      settle(() =>
        client.POST('/auth/v1/sign-up', {
          params: webClient,
          body: { ...input, clientId: 'web' },
        }),
      ),
    confirmSignUp: (login, code) =>
      settle<void>(() =>
        client.POST('/auth/v1/sign-up/confirm', { params: webClient, body: { login, code } }),
      ),
    resendSignUpCode: (login) =>
      settle(() => client.POST('/auth/v1/sign-up/resend', { params: webClient, body: { login } })),
    login: (login, password) =>
      settle(() =>
        client.POST('/auth/v1/login', {
          params: webClient,
          body: { login, password, clientId: 'web' },
        }),
      ),
    loginMfa: (loginToken, code) =>
      settle(() =>
        client.POST('/auth/v1/login/mfa', {
          params: webClient,
          headers: { Authorization: `Login ${loginToken}` },
          body: { code },
        }),
      ),
    refresh: () =>
      settle(() =>
        client.POST('/auth/v1/token', {
          params: webClient,
          body: { grantType: 'refresh_token' },
        }),
      ),
    // Bez treści, więc bez Content-Type (openapi-fetch go wtedy nie ustawia).
    logout: () => settle<void>(() => client.POST('/auth/v1/logout', { params: webClient })),
    getMe: (accessToken) =>
      settle(() =>
        client.GET('/auth/v1/me', { headers: { Authorization: `Bearer ${accessToken}` } }),
      ),
  };
}
