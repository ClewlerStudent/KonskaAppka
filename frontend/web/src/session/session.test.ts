import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ApiResult, TokenResponse } from '../../../src/api/auth-api';
import { createFakeApi, damian, fail, ok, tokens } from '../test/fake-api';
import { REFRESH_MARGIN_MS, createSession } from './session';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('session', () => {
  it('starts signed in when the refresh cookie is valid', async () => {
    const api = createFakeApi();
    api.refresh.mockResolvedValue(ok(tokens()));
    const session = createSession(api);

    expect(session.getSnapshot().status).toBe('loading');
    await session.init();
    expect(session.getSnapshot()).toEqual({ status: 'signedIn', me: damian });
    expect(api.getMe).toHaveBeenCalledTimes(1);
  });

  it('starts signed out when the refresh is rejected', async () => {
    const api = createFakeApi();
    const session = createSession(api);
    await session.init();
    await session.init();
    expect(session.getSnapshot()).toEqual({ status: 'signedOut', me: null });
    expect(api.refresh).toHaveBeenCalledTimes(1);
    expect(api.getMe).not.toHaveBeenCalled();
  });

  it('runs a single refresh for parallel requests', async () => {
    const api = createFakeApi();
    const pending = deferred<ApiResult<TokenResponse>>();
    api.refresh.mockReturnValue(pending.promise);
    const session = createSession(api);
    const call = vi.fn((token: string) => Promise.resolve(ok(token)));

    const first = session.authorized(call);
    const second = session.authorized(call);
    pending.resolve(ok({ accessToken: 'at-shared', tokenType: 'Bearer', expiresIn: 300 }));

    expect(await first).toEqual(ok('at-shared'));
    expect(await second).toEqual(ok('at-shared'));
    expect(api.refresh).toHaveBeenCalledTimes(1);
  });

  it('refreshes once and retries after token_expired', async () => {
    const api = createFakeApi();
    api.loginMfa.mockResolvedValue(
      ok({ accessToken: 'at-old', tokenType: 'Bearer', expiresIn: 300 }),
    );
    api.refresh.mockResolvedValue(
      ok({ accessToken: 'at-new', tokenType: 'Bearer', expiresIn: 300 }),
    );
    const session = createSession(api);
    await session.completeLogin({ accessToken: 'at-old', tokenType: 'Bearer', expiresIn: 300 });

    const call = vi.fn((token: string) =>
      Promise.resolve(token === 'at-old' ? fail(401, 'token_expired') : ok('done')),
    );
    expect(await session.authorized(call)).toEqual(ok('done'));
    expect(call.mock.calls.map(([token]) => token)).toEqual(['at-old', 'at-new']);
    expect(api.refresh).toHaveBeenCalledTimes(1);
    expect(session.getSnapshot().status).toBe('signedIn');
  });

  it('refreshes ahead of time when the token is about to expire', async () => {
    let now = 1_000_000;
    const api = createFakeApi();
    api.refresh.mockResolvedValue(
      ok({ accessToken: 'at-new', tokenType: 'Bearer', expiresIn: 300 }),
    );
    const session = createSession(api, { now: () => now });
    await session.completeLogin({ accessToken: 'at-old', tokenType: 'Bearer', expiresIn: 300 });

    const call = vi.fn((token: string) => Promise.resolve(ok(token)));
    expect(await session.authorized(call)).toEqual(ok('at-old'));
    now += 300_000 - REFRESH_MARGIN_MS + 1;
    expect(await session.authorized(call)).toEqual(ok('at-new'));
  });

  it('signs out when the refresh is rejected', async () => {
    const api = createFakeApi();
    api.refresh.mockResolvedValue(fail(401, 'session_revoked'));
    const session = createSession(api);
    await session.completeLogin(tokens());
    const listener = vi.fn();
    session.subscribe(listener);

    const call = vi.fn(() => Promise.resolve(fail(401, 'token_expired')));
    expect(await session.authorized(call)).toEqual(fail(401, 'session_revoked'));
    expect(session.getSnapshot()).toEqual({ status: 'signedOut', me: null });
    expect(listener).toHaveBeenCalled();
  });

  it('keeps the session on a network error during refresh', async () => {
    const api = createFakeApi();
    api.refresh.mockResolvedValue(fail(0, 'network_error'));
    const session = createSession(api);
    await session.completeLogin(tokens());

    const call = vi.fn(() => Promise.resolve(fail(401, 'token_expired')));
    expect(await session.authorized(call)).toEqual(fail(0, 'network_error'));
    expect(session.getSnapshot().status).toBe('signedIn');
  });

  it('logout calls the API and forgets the token', async () => {
    const api = createFakeApi();
    const session = createSession(api);
    await session.completeLogin(tokens());
    await session.logout();

    expect(api.logout).toHaveBeenCalledTimes(1);
    expect(session.getSnapshot()).toEqual({ status: 'signedOut', me: null });
    const call = vi.fn(() => Promise.resolve(ok('x')));
    expect(await session.authorized(call)).toEqual(fail(401, 'session_revoked'));
    expect(call).not.toHaveBeenCalled();
  });

  it('never writes to Web Storage', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const api = createFakeApi();
    api.refresh.mockResolvedValue(ok(tokens()));
    const session = createSession(api);
    await session.init();
    await session.completeLogin(tokens());
    await session.logout();
    expect(setItem).not.toHaveBeenCalled();
    expect(localStorage.length + sessionStorage.length).toBe(0);
  });
});
