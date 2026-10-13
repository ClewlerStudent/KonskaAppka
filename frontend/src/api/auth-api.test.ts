import { describe, expect, it, vi } from 'vitest';
import { createAuthApi } from './auth-api';

const base = 'http://api.test';

function fakeFetch(response: () => Response) {
  const calls: Request[] = [];
  const fetchImpl = vi.fn((input: Request) => {
    calls.push(input);
    return Promise.resolve(response());
  });
  return { fetchImpl: fetchImpl as unknown as typeof fetch, calls };
}

const jsonResponse = (status: number, body: unknown, type = 'application/json') =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': type } });

describe('createAuthApi', () => {
  it('logs in as the web client', async () => {
    const { fetchImpl, calls } = fakeFetch(() =>
      jsonResponse(200, {
        loginToken: 'lt',
        channel: 'sms',
        maskedContact: '+48 602 *** 145',
        expiresIn: 300,
      }),
    );
    const result = await createAuthApi(base, fetchImpl).login('+48602000145', 'tajne-haslo-1');

    expect(result).toEqual({
      ok: true,
      data: { loginToken: 'lt', channel: 'sms', maskedContact: '+48 602 *** 145', expiresIn: 300 },
    });
    const request = calls[0]!;
    expect(request.method).toBe('POST');
    expect(request.url).toBe(`${base}/auth/v1/login`);
    expect(request.headers.get('x-equenor-client')).toBe('web');
    expect(request.credentials).toBe('include');
    expect(await request.json()).toEqual({
      login: '+48602000145',
      password: 'tajne-haslo-1',
      clientId: 'web',
    });
  });

  it('sends the login token in the MFA step', async () => {
    const { fetchImpl, calls } = fakeFetch(() =>
      jsonResponse(200, { accessToken: 'at', tokenType: 'Bearer', expiresIn: 300 }),
    );
    await createAuthApi(base, fetchImpl).loginMfa('lt-1', '123456');
    expect(calls[0]!.headers.get('authorization')).toBe('Login lt-1');
    expect(await calls[0]!.json()).toEqual({ code: '123456' });
  });

  it('refreshes from the cookie with the web client header', async () => {
    const { fetchImpl, calls } = fakeFetch(() =>
      jsonResponse(200, { accessToken: 'at', tokenType: 'Bearer', expiresIn: 300 }),
    );
    await createAuthApi(base, fetchImpl).refresh();
    expect(calls[0]!.url).toBe(`${base}/auth/v1/token`);
    expect(calls[0]!.headers.get('x-equenor-client')).toBe('web');
    expect(await calls[0]!.json()).toEqual({ grantType: 'refresh_token' });
  });

  it('logs out without a body and without Content-Type', async () => {
    const { fetchImpl, calls } = fakeFetch(() => new Response(null, { status: 204 }));
    expect(await createAuthApi(base, fetchImpl).logout()).toEqual({ ok: true, data: undefined });
    expect(calls[0]!.headers.get('content-type')).toBeNull();
    expect(calls[0]!.body).toBeNull();
  });

  it('reads the profile with the access token', async () => {
    const { fetchImpl, calls } = fakeFetch(() => jsonResponse(200, { id: 'x' }));
    await createAuthApi(base, fetchImpl).getMe('at-1');
    expect(calls[0]!.method).toBe('GET');
    expect(calls[0]!.headers.get('authorization')).toBe('Bearer at-1');
  });

  it('maps problem+json to the error code', async () => {
    const { fetchImpl } = fakeFetch(() =>
      jsonResponse(
        401,
        {
          type: 'urn:equenor:problem:invalid_credentials',
          title: 'Invalid credentials',
          status: 401,
          code: 'invalid_credentials',
        },
        'application/problem+json',
      ),
    );
    expect(await createAuthApi(base, fetchImpl).login('+48602000145', 'zle')).toEqual({
      ok: false,
      status: 401,
      code: 'invalid_credentials',
    });
  });

  it('reports responses outside the contract and network errors', async () => {
    const html = fakeFetch(() => new Response('<html>Bad gateway</html>', { status: 502 }));
    expect(await createAuthApi(base, html.fetchImpl).refresh()).toEqual({
      ok: false,
      status: 502,
      code: 'unexpected_response',
    });

    const offline = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')));
    expect(
      await createAuthApi(base, offline as unknown as typeof fetch).resendSignUpCode('a@b.pl'),
    ).toEqual({ ok: false, status: 0, code: 'network_error' });
  });
});
