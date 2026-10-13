import { vi, type Mocked } from 'vitest';
import type {
  ApiFailure,
  ApiResult,
  AuthApi,
  FailureCode,
  MeResponse,
  TokenResponse,
} from '../../../src/api/auth-api';

export const ok = <T>(data: T): ApiResult<T> => ({ ok: true, data });

export const fail = (status: number, code: FailureCode): ApiFailure => ({
  ok: false,
  status,
  code,
});

export const damian: MeResponse = {
  id: '0199c6a0-0000-7000-8000-000000000001',
  displayName: 'Damian',
  locale: 'pl',
  contact: { phoneMasked: '+48 602 *** 145', emailMasked: 'd•••@stajnielipowe.pl' },
  businesses: [],
  startView: 'welcome',
};

let issued = 0;
export const tokens = (expiresIn = 300): TokenResponse => ({
  accessToken: `at-${++issued}`,
  tokenType: 'Bearer',
  expiresIn,
});

/** Fałszywe API auth: domyślnie brak sesji (refresh 401) i udane pozostałe wywołania. */
export function createFakeApi(): Mocked<AuthApi> {
  return {
    signUp: vi.fn<AuthApi['signUp']>(() =>
      Promise.resolve(ok({ channel: 'email', maskedContact: 'j•••@stajniabrzozowa.pl' })),
    ),
    confirmSignUp: vi.fn<AuthApi['confirmSignUp']>(() => Promise.resolve(ok(undefined))),
    resendSignUpCode: vi.fn<AuthApi['resendSignUpCode']>(() =>
      Promise.resolve(ok({ channel: 'sms', maskedContact: '+48 602 *** 145' })),
    ),
    login: vi.fn<AuthApi['login']>(() =>
      Promise.resolve(
        ok({
          loginToken: 'lt-1',
          channel: 'sms',
          maskedContact: '+48 602 *** 145',
          expiresIn: 300,
        }),
      ),
    ),
    loginMfa: vi.fn<AuthApi['loginMfa']>(() => Promise.resolve(ok(tokens()))),
    refresh: vi.fn<AuthApi['refresh']>(() => Promise.resolve(fail(401, 'session_revoked'))),
    logout: vi.fn<AuthApi['logout']>(() => Promise.resolve(ok(undefined))),
    getMe: vi.fn<AuthApi['getMe']>(() => Promise.resolve(ok(damian))),
  };
}
