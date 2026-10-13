import type {
  ApiFailure,
  ApiResult,
  AuthApi,
  MeResponse,
  TokenResponse,
} from '../../../src/api/auth-api';

/**
 * Sesja panelu. Access token żyje tylko w pamięci tego modułu (nigdy w Web Storage);
 * refresh token jest w ciasteczku HttpOnly, którego strona nie widzi.
 */
export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

export interface SessionSnapshot {
  readonly status: SessionStatus;
  readonly me: MeResponse | null;
}

export interface Session {
  /** Ciche odświeżenie z ciasteczka i GET /me; kolejne wywołania zwracają tę samą obietnicę. */
  readonly init: () => Promise<void>;
  readonly getSnapshot: () => SessionSnapshot;
  readonly subscribe: (listener: () => void) => () => void;
  /** Po kroku MFA: zapamiętuje access token i pobiera profil. */
  readonly completeLogin: (tokens: TokenResponse) => Promise<ApiResult<MeResponse>>;
  /** Żądanie z access tokenem: odświeża go, gdy brak albo wygasa, i raz ponawia po token_expired. */
  readonly authorized: <T>(
    call: (accessToken: string) => Promise<ApiResult<T>>,
  ) => Promise<ApiResult<T>>;
  readonly logout: () => Promise<void>;
}

export interface SessionOptions {
  now?: () => number;
}

/** Odświeżamy token, któremu zostało mniej niż tyle życia. */
export const REFRESH_MARGIN_MS = 30_000;

const signedOutFailure: ApiFailure = { ok: false, status: 401, code: 'session_revoked' };

export function createSession(api: AuthApi, { now = Date.now }: SessionOptions = {}): Session {
  let access: { token: string; expiresAt: number } | null = null;
  let snapshot: SessionSnapshot = { status: 'loading', me: null };
  let refreshing: Promise<ApiResult<string>> | null = null;
  let initializing: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  function publish(next: SessionSnapshot) {
    snapshot = next;
    for (const listener of listeners) listener();
  }

  function storeTokens(tokens: TokenResponse) {
    access = { token: tokens.accessToken, expiresAt: now() + tokens.expiresIn * 1000 };
  }

  function signOutLocally() {
    access = null;
    if (snapshot.status !== 'signedOut' || snapshot.me) publish({ status: 'signedOut', me: null });
  }

  /** Jedno odświeżenie naraz; 401 i 403 kończą sesję, błąd sieci nie. */
  function refresh(): Promise<ApiResult<string>> {
    refreshing ??= (async (): Promise<ApiResult<string>> => {
      const result = await api.refresh();
      if (result.ok) {
        storeTokens(result.data);
        return { ok: true, data: result.data.accessToken };
      }
      if (result.status === 401 || result.status === 403) signOutLocally();
      return result;
    })().finally(() => {
      refreshing = null;
    });
    return refreshing;
  }

  function validToken(): Promise<ApiResult<string>> {
    if (access && access.expiresAt - now() > REFRESH_MARGIN_MS) {
      return Promise.resolve({ ok: true, data: access.token });
    }
    return refresh();
  }

  async function authorized<T>(
    call: (accessToken: string) => Promise<ApiResult<T>>,
  ): Promise<ApiResult<T>> {
    const token = await validToken();
    if (!token.ok) return token;
    let result = await call(token.data);
    if (!result.ok && result.status === 401 && result.code === 'token_expired') {
      const renewed = await refresh();
      if (!renewed.ok) return renewed;
      result = await call(renewed.data);
    }
    if (!result.ok && result.status === 401) signOutLocally();
    return result;
  }

  async function loadMe(): Promise<ApiResult<MeResponse>> {
    const result = await authorized((token) => api.getMe(token));
    if (result.ok) publish({ status: 'signedIn', me: result.data });
    else signOutLocally();
    return result;
  }

  return {
    init() {
      initializing ??= (async () => {
        const token = await refresh();
        if (token.ok) await loadMe();
        else signOutLocally();
      })();
      return initializing;
    },
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async completeLogin(tokens) {
      storeTokens(tokens);
      return loadMe();
    },
    async authorized(call) {
      if (!access && snapshot.status === 'signedOut') return signedOutFailure;
      return authorized(call);
    },
    async logout() {
      try {
        await api.logout();
      } finally {
        signOutLocally();
      }
    },
  };
}
