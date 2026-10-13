import { readFileSync } from 'node:fs';
import { decodeJwt, decodeProtectedHeader } from 'jose';
import { describe, expect, it } from 'vitest';
import { createFakeClock, epochSeconds } from '../../kit/clock.js';
import { createLogger } from '../../kit/logger.js';
import { routeKey } from '../../kit/route.js';
import { createAccessTokenVerifier } from '../../lib/auth/verify.js';
import { MemoryAccessRepository } from './access/memory-access.js';
import { buildAuthApp } from './app.js';
import { createMemoryCodeSender } from './codes/code-sender.js';
import { seedDemoUsers } from './identity/demo-users.js';
import { FakeIdentityProvider } from './identity/fake-idp.js';
import { createSigner, generateEphemeralSigningKey } from './tokens/signer.js';
import { MemoryUserRepository } from './users/memory-users.js';

const DEMO_PASSWORD = 'haslo-demo-do-testow';
const ISSUER = 'http://localhost:4010/auth/v1';
const PANEL = 'http://localhost:5173';
const DAMIAN_PHONE = '602 000 145';
const DAMIAN_ID = '0199c6a0-0000-7000-8000-000000000001';
const COOKIE = '__Secure-eq_rt';
const DAY = 86_400;

type ClientId = 'web' | 'mobile' | 'tablet';

interface TokenBody {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
}

interface SetupOptions {
  port?: number;
  jwksPort?: number;
  trustProxy?: readonly string[];
  credentialCheckMinMs?: number;
}

async function setup(options: SetupOptions = {}) {
  const clock = createFakeClock();
  const logLines: string[] = [];
  const logger = createLogger(
    { service: 'auth', level: 'trace' },
    { write: (line) => logLines.push(line) },
  );
  const signer = await createSigner(generateEphemeralSigningKey());
  const idp = new FakeIdentityProvider(clock);
  await seedDemoUsers(idp, DEMO_PASSWORD);
  const codes = createMemoryCodeSender();
  const users = new MemoryUserRepository();
  const access = new MemoryAccessRepository();
  const service = await buildAuthApp({
    config: {
      appEnv: 'test',
      issuer: ISSUER,
      allowedOrigins: [PANEL],
      host: '127.0.0.1',
      port: options.port ?? 4010,
      jwksPort: options.jwksPort ?? 4011,
      trustProxy: options.trustProxy ?? [],
      rateLimitFactor: 1,
      credentialCheckMinMs: options.credentialCheckMinMs ?? 0,
    },
    logger,
    clock,
    signer,
    idp,
    codes,
    users,
    access,
  });

  const inject = service.external.inject.bind(service.external);
  const post = (url: string, body?: unknown, headers: Record<string, string> = {}) =>
    inject({
      method: 'POST',
      url,
      headers: { 'content-type': 'application/json', ...headers },
      ...(body === undefined ? {} : { payload: JSON.stringify(body) }),
    });
  const lastMessage = () => {
    const message = codes.messages.at(-1);
    if (!message) throw new Error('no message sent');
    return message;
  };

  /** Hasło → token logowania i kod MFA ze skrzynki. */
  async function startLogin(login: string, clientId: ClientId = 'web', password = DEMO_PASSWORD) {
    const res = await post('/auth/v1/login', { login, password, clientId });
    expect(res.statusCode, res.body).toBe(200);
    const body = res.json<{ loginToken: string; channel: string; maskedContact: string }>();
    return { ...body, code: lastMessage().code ?? '' };
  }

  async function mfa(loginToken: string, code: string, headers: Record<string, string> = {}) {
    return post(
      '/auth/v1/login/mfa',
      { code },
      { authorization: `Login ${loginToken}`, ...headers },
    );
  }

  /** Pełne logowanie: tokeny i ciasteczko (web) albo refresh token w treści (apki). */
  async function signIn(login: string, clientId: ClientId = 'web') {
    const started = await startLogin(login, clientId);
    const res = await mfa(started.loginToken, started.code);
    expect(res.statusCode, res.body).toBe(200);
    const body = res.json<TokenBody>();
    const cookie = res.cookies.find((c) => c.name === COOKIE)?.value;
    return { res, body, accessToken: body.accessToken, refresh: cookie ?? body.refreshToken ?? '' };
  }

  const refreshWithCookie = (
    token: string,
    headers: Record<string, string> = { 'x-equenor-client': 'web' },
  ) =>
    inject({
      method: 'POST',
      url: '/auth/v1/token',
      headers: { 'content-type': 'application/json', ...headers },
      cookies: { [COOKIE]: token },
      payload: JSON.stringify({ grantType: 'refresh_token' }),
    });

  const me = (accessToken: string) =>
    inject({
      method: 'GET',
      url: '/auth/v1/me',
      headers: { authorization: `Bearer ${accessToken}` },
    });

  return {
    service,
    clock,
    codes,
    users,
    access,
    signer,
    logLines,
    inject,
    post,
    lastMessage,
    startLogin,
    mfa,
    signIn,
    refreshWithCookie,
    me,
  };
}

type Harness = Awaited<ReturnType<typeof setup>>;

async function signUpAndConfirm(t: Harness, login: string, password = 'dobre-haslo-123') {
  const res = await t.post('/auth/v1/sign-up', {
    login,
    password,
    displayName: 'Zofia',
    locale: 'pl',
    clientId: 'web',
  });
  expect(res.statusCode, res.body).toBe(202);
  const code = t.lastMessage().code ?? '';
  expect((await t.post('/auth/v1/sign-up/confirm', { login, code })).statusCode).toBe(204);
  return res;
}

describe('auth: route kinds', () => {
  it('opens exactly the routes from open-routes.txt; every other route needs a token', async () => {
    const t = await setup();
    const listed = readFileSync(new URL('../../../open-routes.txt', import.meta.url), 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('#'));
    const open = t.service.routes
      .filter((r) => r.kind === 'open')
      .map(routeKey)
      .sort();
    // Przy różnicy diff pokazuje obie listy: zmiana tras otwartych wymaga zmiany open-routes.txt.
    expect(open, 'open-routes.txt').toEqual([...listed].sort());

    const external = t.service.routes.filter((r) => r.kind === 'external');
    expect(external.length).toBeGreaterThan(0);
    for (const route of external) {
      const res = await t.inject({ method: route.method, url: route.path });
      expect(res.json(), routeKey(route)).toMatchObject({ status: 401, code: 'invalid_token' });
    }
  });
});

describe('auth: full flow', () => {
  it('signs up, confirms, logs in with MFA, reads /me, refreshes and logs out', async () => {
    const t = await setup();
    const login = 'Zofia@Example.com';
    const password = 'dobre-haslo-123';

    const signUp = await t.post('/auth/v1/sign-up', {
      login,
      password,
      displayName: 'Zofia',
      locale: 'pl',
      clientId: 'web',
    });
    expect(signUp.statusCode).toBe(202);
    expect(signUp.json()).toEqual({ channel: 'email', maskedContact: 'z•••@example.com' });
    const verify = t.lastMessage();
    expect(verify).toMatchObject({ channel: 'email', to: 'zofia@example.com', purpose: 'verify' });
    expect(verify.code).toMatch(/^\d{8}$/);

    const confirm = await t.post('/auth/v1/sign-up/confirm', { login, code: verify.code });
    expect(confirm.statusCode).toBe(204);
    expect(confirm.body).toBe('');

    const started = await t.post('/auth/v1/login', { login, password, clientId: 'web' });
    expect(started.statusCode).toBe(200);
    const loginBody = started.json<{ loginToken: string }>();
    expect(loginBody).toMatchObject({
      channel: 'email',
      maskedContact: 'z•••@example.com',
      expiresIn: 300,
    });
    expect(decodeProtectedHeader(loginBody.loginToken)).toMatchObject({ typ: 'login+jwt' });
    const mfaCode = t.lastMessage();
    expect(mfaCode).toMatchObject({ purpose: 'mfa', subject: 'Kod logowania EQUENOR' });
    expect(mfaCode.code).toMatch(/^\d{6}$/);

    const signedIn = await t.mfa(loginBody.loginToken, mfaCode.code ?? '');
    expect(signedIn.statusCode).toBe(200);
    const tokens = signedIn.json<TokenBody>();
    expect(tokens).toEqual({
      accessToken: expect.any(String) as unknown,
      tokenType: 'Bearer',
      expiresIn: 300,
    });
    const setCookie = String(signedIn.headers['set-cookie']);
    expect(setCookie).toMatch(/^__Secure-eq_rt=[\w-]+\.[\w-]+\.[\w-]+; /);
    expect(setCookie.split('; ').slice(1).sort()).toEqual(
      ['HttpOnly', 'Max-Age=604800', 'Path=/auth/v1/token', 'SameSite=Strict', 'Secure'].sort(),
    );

    const header = decodeProtectedHeader(tokens.accessToken);
    expect(header).toEqual({ alg: 'ES256', typ: 'at+jwt', kid: t.signer.kid });
    const claims = decodeJwt(tokens.accessToken);
    const now = epochSeconds(t.clock);
    expect(claims).toEqual({
      iss: ISSUER,
      aud: 'equenor-api',
      sub: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-7/) as unknown,
      sid: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-7/) as unknown,
      client_id: 'web',
      iat: now,
      exp: now + 300,
      jti: expect.any(String) as unknown,
      ver: 1,
      amr: ['pwd', 'otp'],
      auth_time: now,
    });

    const profile = await t.me(tokens.accessToken);
    expect(profile.statusCode).toBe(200);
    expect(profile.json()).toEqual({
      id: claims.sub,
      displayName: 'Zofia',
      locale: 'pl',
      contact: { phoneMasked: null, emailMasked: 'z•••@example.com' },
      businesses: [],
      startView: 'welcome',
    });

    const refreshToken = signedIn.cookies.find((c) => c.name === COOKIE)?.value ?? '';
    const refreshClaims = decodeJwt(refreshToken);
    expect(decodeProtectedHeader(refreshToken).typ).toBe('rt+jwt');
    expect(refreshClaims).toMatchObject({ aud: 'equenor-auth', sid: claims.sid, sst: now, tv: 0 });

    t.clock.advanceSeconds(3 * DAY);
    const refreshed = await t.refreshWithCookie(refreshToken);
    expect(refreshed.statusCode, refreshed.body).toBe(200);
    const next = decodeJwt(refreshed.json<TokenBody>().accessToken);
    expect(next).toMatchObject({ sid: claims.sid, auth_time: now, iat: now + 3 * DAY });
    const nextRefresh = refreshed.cookies.find((c) => c.name === COOKIE);
    expect(decodeJwt(nextRefresh?.value ?? '')).toMatchObject({ sid: claims.sid, sst: now });
    expect(nextRefresh?.maxAge).toBe(7 * DAY);

    const loggedOut = await t.post('/auth/v1/logout');
    expect(loggedOut.statusCode).toBe(204);
    expect(String(loggedOut.headers['set-cookie'])).toMatch(
      /^__Secure-eq_rt=; Max-Age=0; Path=\/auth\/v1\/token; HttpOnly; Secure; SameSite=Strict$/,
    );
  });

  it('keeps passwords, codes and tokens out of the logs', async () => {
    const t = await setup();
    const login = 'logi@example.com';
    const password = 'haslo-ktore-nie-trafi-do-logow';
    await t.post('/auth/v1/sign-up', {
      login,
      password,
      displayName: 'Logi',
      locale: 'pl',
      clientId: 'web',
    });
    const verifyCode = t.lastMessage().code ?? '';
    await t.post('/auth/v1/sign-up/confirm', { login, code: '00000000' });
    await t.post('/auth/v1/sign-up/confirm', { login, code: verifyCode });
    await t.post('/auth/v1/login', { login, password: 'zle-haslo-do-logow', clientId: 'web' });
    const started = await t.startLogin(login, 'web', password);
    await t.mfa(started.loginToken, started.code === '000000' ? '111111' : '000000');
    const signedIn = await t.mfa(started.loginToken, started.code);
    const tokens = signedIn.json<TokenBody>();
    const refresh = signedIn.cookies.find((c) => c.name === COOKIE)?.value ?? '';
    await t.me(tokens.accessToken);
    await t.refreshWithCookie(refresh);
    const mobile = await t.signIn(DAMIAN_PHONE, 'mobile');

    const logs = t.logLines.join('\n');
    expect(logs).toContain('incoming request');
    for (const secret of [
      password,
      'zle-haslo-do-logow',
      DEMO_PASSWORD,
      verifyCode,
      started.code,
      started.loginToken,
      tokens.accessToken,
      refresh,
      mobile.accessToken,
      mobile.refresh,
    ]) {
      expect(logs).not.toContain(secret);
    }
  });
});

describe('auth: sign-up', () => {
  it('answers the same for a confirmed contact, sends "existing account" and creates nothing', async () => {
    const t = await setup();
    const res = await t.post('/auth/v1/sign-up', {
      login: '+48602000145',
      password: 'inne-haslo-123',
      displayName: 'Ktoś',
      locale: 'pl',
      clientId: 'mobile',
    });
    expect(res.statusCode).toBe(202);
    expect(res.json()).toEqual({ channel: 'sms', maskedContact: '+48 602 *** 145' });
    expect(t.lastMessage()).toMatchObject({ purpose: 'existing_account', to: '+48602000145' });
    expect(t.lastMessage()).not.toHaveProperty('code');
    const withNewPassword = await t.post('/auth/v1/login', {
      login: DAMIAN_PHONE,
      password: 'inne-haslo-123',
      clientId: 'web',
    });
    expect(withNewPassword.statusCode).toBe(401);
    await t.startLogin(DAMIAN_PHONE);
  });

  it('replaces an unconfirmed account on the same contact', async () => {
    const t = await setup();
    const login = '601 234 567';
    const first = await t.post('/auth/v1/sign-up', {
      login,
      password: 'pierwsze-haslo-1',
      displayName: 'Ktoś obcy',
      locale: 'pl',
      clientId: 'web',
    });
    expect(first.json()).toEqual({ channel: 'sms', maskedContact: '+48 601 *** 567' });
    const oldCode = t.lastMessage().code ?? '';
    await signUpAndConfirm(t, login, 'drugie-haslo-12');
    expect((await t.post('/auth/v1/sign-up/confirm', { login, code: oldCode })).statusCode).toBe(
      401,
    );
    const old = await t.post('/auth/v1/login', {
      login,
      password: 'pierwsze-haslo-1',
      clientId: 'web',
    });
    expect(old.json()).toMatchObject({ code: 'invalid_credentials' });
    await t.startLogin(login, 'web', 'drugie-haslo-12');
  });

  it('rejects weak passwords, bad logins and wrong codes', async () => {
    const t = await setup();
    const weak = await t.post('/auth/v1/sign-up', {
      login: 'a@example.com',
      password: 'krotkie',
      displayName: 'A',
      locale: 'pl',
      clientId: 'web',
    });
    expect(weak.json()).toMatchObject({ status: 422, code: 'weak_password' });
    const badLogin = await t.post('/auth/v1/sign-up', {
      login: 'to-nie-kontakt',
      password: 'dobre-haslo-123',
      displayName: 'A',
      locale: 'pl',
      clientId: 'web',
    });
    expect(badLogin.json()).toMatchObject({ status: 400, code: 'validation_failed' });
    expect(badLogin.body).not.toContain('to-nie-kontakt');
    const unknown = await t.post('/auth/v1/sign-up/confirm', {
      login: 'nikt@example.com',
      code: '12345678',
    });
    expect(unknown.json()).toMatchObject({ status: 401, code: 'invalid_code' });
  });

  it('resends a code only to unconfirmed accounts, answering the same either way', async () => {
    const t = await setup();
    await t.post('/auth/v1/sign-up', {
      login: 'b@example.com',
      password: 'dobre-haslo-123',
      displayName: 'B',
      locale: 'pl',
      clientId: 'web',
    });
    const sent = t.codes.messages.length;
    const resent = await t.post('/auth/v1/sign-up/resend', { login: 'b@example.com' });
    expect(resent.json()).toEqual({ channel: 'email', maskedContact: 'b•••@example.com' });
    expect(t.codes.messages).toHaveLength(sent + 1);
    expect(t.lastMessage()).toMatchObject({ purpose: 'verify' });

    for (const login of ['nikt@example.com', 'damian@stajnielipowe.pl']) {
      const res = await t.post('/auth/v1/sign-up/resend', { login });
      expect(res.statusCode).toBe(202);
    }
    expect(t.codes.messages).toHaveLength(sent + 1);
  });
});

describe('auth: login', () => {
  it('answers a wrong password and an unknown account identically', async () => {
    const t = await setup();
    const wrong = await t.post('/auth/v1/login', {
      login: DAMIAN_PHONE,
      password: 'zle-haslo-123',
      clientId: 'web',
    });
    const unknown = await t.post('/auth/v1/login', {
      login: '609 999 999',
      password: 'zle-haslo-123',
      clientId: 'web',
    });
    expect(wrong.statusCode).toBe(401);
    expect(unknown.statusCode).toBe(401);
    expect(unknown.json()).toEqual(wrong.json());
    expect(wrong.json()).toMatchObject({ code: 'invalid_credentials' });
    expect(t.codes.messages).toHaveLength(0);
  });

  it('answers an unknown account, a wrong password and sign-ups no sooner than the floor', async () => {
    const floor = 80;
    const t = await setup({ credentialCheckMinMs: floor });
    const timed = async (url: string, body: unknown) => {
      const start = performance.now();
      const res = await t.post(url, body);
      return { status: res.statusCode, ms: performance.now() - start };
    };
    const results = [
      await timed('/auth/v1/login', {
        login: 'nikt@example.com',
        password: 'zle-haslo-123',
        clientId: 'web',
      }),
      await timed('/auth/v1/login', {
        login: DAMIAN_PHONE,
        password: 'zle-haslo-123',
        clientId: 'web',
      }),
      await timed('/auth/v1/sign-up', {
        login: DAMIAN_PHONE,
        password: 'dobre-haslo-123',
        displayName: 'Damian',
        locale: 'pl',
        clientId: 'web',
      }),
      await timed('/auth/v1/sign-up', {
        login: 'nowa@example.com',
        password: 'dobre-haslo-123',
        displayName: 'Nowa',
        locale: 'pl',
        clientId: 'web',
      }),
    ];
    expect(results.map((r) => r.status)).toEqual([401, 401, 202, 202]);
    // Zapas 2 ms na zaokrąglenie timerów.
    for (const { ms } of results) expect(ms).toBeGreaterThanOrEqual(floor - 2);
  });

  it('sends the MFA code to the account channel, also when logging in by e-mail', async () => {
    const t = await setup();
    const damian = await t.startLogin('damian@stajnielipowe.pl');
    expect(damian).toMatchObject({ channel: 'sms', maskedContact: '+48 602 *** 145' });
    expect(t.lastMessage()).toMatchObject({ channel: 'sms', to: '+48602000145', purpose: 'mfa' });
    expect(t.lastMessage().body).toBe(
      `Kod logowania EQUENOR: ${damian.code}. Ważny 5 minut. Nie podawaj go nikomu.`,
    );
    const marta = await t.startLogin('marta@stajnielipowe.pl');
    expect(marta).toMatchObject({ channel: 'email', maskedContact: 'm•••@stajnielipowe.pl' });
  });

  it('reports an unconfirmed account only after the right password', async () => {
    const t = await setup();
    await t.post('/auth/v1/sign-up', {
      login: 'c@example.com',
      password: 'dobre-haslo-123',
      displayName: 'C',
      locale: 'pl',
      clientId: 'web',
    });
    const right = await t.post('/auth/v1/login', {
      login: 'c@example.com',
      password: 'dobre-haslo-123',
      clientId: 'web',
    });
    expect(right.json()).toMatchObject({ status: 409, code: 'account_not_confirmed' });
    const wrong = await t.post('/auth/v1/login', {
      login: 'c@example.com',
      password: 'zle-haslo-123',
      clientId: 'web',
    });
    expect(wrong.json()).toMatchObject({ status: 401, code: 'invalid_credentials' });
  });

  it('accepts the right code after a wrong one and locks after 5 wrong codes', async () => {
    const t = await setup();
    const first = await t.startLogin(DAMIAN_PHONE);
    const bad = first.code === '000000' ? '111111' : '000000';
    const wrong = await t.mfa(first.loginToken, bad);
    expect(wrong.json()).toMatchObject({ status: 401, code: 'invalid_code' });
    expect((await t.mfa(first.loginToken, first.code)).statusCode).toBe(200);
    // Token logowania działa raz: sesja dostawcy tożsamości jest już zamknięta.
    expect((await t.mfa(first.loginToken, first.code)).json()).toMatchObject({
      code: 'invalid_token',
    });

    const second = await t.startLogin(DAMIAN_PHONE);
    const other = second.code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 4; i++) {
      expect((await t.mfa(second.loginToken, other)).json()).toMatchObject({
        code: 'invalid_code',
      });
    }
    expect((await t.mfa(second.loginToken, other)).json()).toMatchObject({
      status: 403,
      code: 'account_locked',
    });
    const again = await t.post('/auth/v1/login', {
      login: DAMIAN_PHONE,
      password: DEMO_PASSWORD,
      clientId: 'web',
    });
    expect(again.json()).toMatchObject({ status: 403, code: 'account_locked' });
  });

  it('limits logins per contact: the 11th in 15 minutes gets 429', async () => {
    const t = await setup();
    const spellings = [DAMIAN_PHONE, '+48602000145', '602-000-145'];
    for (let i = 0; i < 10; i++) {
      const res = await t.post('/auth/v1/login', {
        login: spellings[i % 3],
        password: 'zle-haslo-123',
        clientId: 'web',
      });
      expect(res.statusCode).toBe(401);
    }
    const limited = await t.post('/auth/v1/login', {
      login: DAMIAN_PHONE,
      password: DEMO_PASSWORD,
      clientId: 'web',
    });
    expect(limited.statusCode).toBe(429);
    expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
    // Inny login z tego samego IP przechodzi.
    expect(
      (
        await t.post('/auth/v1/login', {
          login: 'marta@stajnielipowe.pl',
          password: DEMO_PASSWORD,
          clientId: 'web',
        })
      ).statusCode,
    ).toBe(200);
  });

  it('limits MFA attempts per login token: the 11th in 5 minutes gets 429', async () => {
    const t = await setup();
    const started = await t.startLogin(DAMIAN_PHONE);
    const bad = started.code === '000000' ? '111111' : '000000';
    // Inny zapis nagłówka nie daje nowego licznika: trasa go odrzuca bez pytania dostawcy.
    for (const spaced of [`Login  ${started.loginToken}`, `Login   ${started.loginToken}`]) {
      const res = await t.post('/auth/v1/login/mfa', { code: bad }, { authorization: spaced });
      expect(res.json()).toMatchObject({ status: 401, code: 'invalid_token' });
    }
    for (let i = 0; i < 10; i++) {
      const res = await t.mfa(started.loginToken, bad);
      // Zły kod: 401 invalid_code, po 5 złych kodach dostawca blokuje konto (403); limit liczy dalej.
      expect(res.json<{ code: string }>().code).toBe(i < 4 ? 'invalid_code' : 'account_locked');
    }
    const limited = await t.mfa(started.loginToken, started.code);
    expect(limited.statusCode).toBe(429);
    expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('behind a proxy takes the client address the proxy added, not the ones the client sent', async () => {
    // inject łączy się z 127.0.0.1, czyli „z proxy”.
    const t = await setup({ trustProxy: ['127.0.0.1'] });
    const statuses: number[] = [];
    for (let i = 0; i < 31; i++) {
      // Lewe wpisy X-Forwarded-For podaje klient; proxy dopisuje prawdziwy adres na końcu.
      const res = await t.post(
        '/auth/v1/login',
        { login: `osoba${i}@example.com`, password: 'zle-haslo-123', clientId: 'web' },
        { 'x-forwarded-for': `10.0.${i}.1, 203.0.113.7` },
      );
      statuses.push(res.statusCode);
    }
    expect(statuses.slice(0, 30).every((status) => status === 401)).toBe(true);
    expect(statuses[30]).toBe(429);
    // Inny klient za tym samym proxy ma własny licznik.
    const other = await t.post(
      '/auth/v1/login',
      { login: 'ktos@example.com', password: 'zle-haslo-123', clientId: 'web' },
      { 'x-forwarded-for': '10.0.0.1, 203.0.113.8' },
    );
    expect(other.statusCode).toBe(401);
  });

  it('checks the browser origin and the app of the account', async () => {
    const t = await setup();
    const browser = { origin: PANEL, 'x-equenor-client': 'web' };
    const mobileFromBrowser = await t.post(
      '/auth/v1/login',
      { login: DAMIAN_PHONE, password: DEMO_PASSWORD, clientId: 'mobile' },
      browser,
    );
    expect(mobileFromBrowser.json()).toMatchObject({ status: 403, code: 'client_not_allowed' });
    const foreign = await t.post(
      '/auth/v1/login',
      { login: DAMIAN_PHONE, password: DEMO_PASSWORD, clientId: 'web' },
      { origin: 'https://evil.example', 'x-equenor-client': 'web' },
    );
    expect(foreign.json()).toMatchObject({ status: 403, code: 'origin_not_allowed' });

    const fromPanel = await t.post(
      '/auth/v1/login',
      { login: DAMIAN_PHONE, password: DEMO_PASSWORD, clientId: 'web' },
      browser,
    );
    expect(fromPanel.statusCode).toBe(200);
    expect(fromPanel.headers['access-control-allow-origin']).toBe(PANEL);

    const tablet = await t.startLogin(DAMIAN_PHONE, 'tablet');
    const res = await t.mfa(tablet.loginToken, tablet.code);
    expect(res.json()).toMatchObject({ status: 403, code: 'wrong_client' });
  });
});

describe('auth: token types', () => {
  it('rejects an expired login token and tokens of the wrong type', async () => {
    const t = await setup();
    const expired = await t.startLogin(DAMIAN_PHONE);
    t.clock.advanceSeconds(301);
    expect((await t.mfa(expired.loginToken, expired.code)).json()).toMatchObject({
      status: 401,
      code: 'invalid_token',
    });

    const session = await t.signIn(DAMIAN_PHONE, 'mobile');
    const pending = await t.startLogin(DAMIAN_PHONE);
    // Token logowania jako Bearer, access token jako token logowania, refresh token jako Bearer.
    expect((await t.me(pending.loginToken)).json()).toMatchObject({ code: 'invalid_token' });
    expect((await t.mfa(session.accessToken, pending.code)).json()).toMatchObject({
      code: 'invalid_token',
    });
    expect((await t.me(session.refresh)).json()).toMatchObject({ code: 'invalid_token' });
    expect((await t.inject({ method: 'GET', url: '/auth/v1/me' })).json()).toMatchObject({
      status: 401,
      code: 'invalid_token',
    });

    t.clock.advanceSeconds(300);
    expect((await t.me(session.accessToken)).json()).toMatchObject({ code: 'token_expired' });
  });
});

describe('auth: refresh', () => {
  it('gives mobile apps the refresh token in the body', async () => {
    const t = await setup();
    const session = await t.signIn(DAMIAN_PHONE, 'mobile');
    expect(session.res.headers['set-cookie']).toBeUndefined();
    expect(decodeJwt(session.refresh)).toMatchObject({ client_id: 'mobile', aud: 'equenor-auth' });
    const refreshed = await t.post('/auth/v1/token', {
      grantType: 'refresh_token',
      refreshToken: session.refresh,
    });
    expect(refreshed.statusCode).toBe(200);
    expect(refreshed.json<TokenBody>().refreshToken).toEqual(expect.any(String));
    // Refresh token panelu nie jedzie w treści, a apki w ciasteczku.
    const web = await t.signIn(DAMIAN_PHONE, 'web');
    const webInBody = await t.post('/auth/v1/token', {
      grantType: 'refresh_token',
      refreshToken: web.refresh,
    });
    expect(webInBody.json()).toMatchObject({ status: 403, code: 'wrong_client' });
    expect((await t.refreshWithCookie(session.refresh)).json()).toMatchObject({
      code: 'wrong_client',
    });
  });

  it('needs X-Equenor-Client with the cookie', async () => {
    const t = await setup();
    const session = await t.signIn(DAMIAN_PHONE);
    const res = await t.refreshWithCookie(session.refresh, {});
    expect(res.json()).toMatchObject({ status: 403, code: 'origin_not_allowed' });
    const none = await t.post(
      '/auth/v1/token',
      { grantType: 'refresh_token' },
      {
        'x-equenor-client': 'web',
      },
    );
    expect(none.json()).toMatchObject({ status: 401, code: 'session_revoked' });
  });

  it('revokes after 7 idle days', async () => {
    const t = await setup();
    const session = await t.signIn(DAMIAN_PHONE);
    t.clock.advanceSeconds(7 * DAY);
    expect((await t.refreshWithCookie(session.refresh)).json()).toMatchObject({
      status: 401,
      code: 'session_revoked',
    });
  });

  it('revokes after a token_version bump or account deletion', async () => {
    const t = await setup();
    const first = await t.signIn(DAMIAN_PHONE);
    t.users.update(DAMIAN_ID, { tokenVersion: 1 });
    expect((await t.refreshWithCookie(first.refresh)).json()).toMatchObject({
      code: 'session_revoked',
    });
    const second = await t.signIn(DAMIAN_PHONE);
    expect(decodeJwt(second.refresh).tv).toBe(1);
    expect((await t.refreshWithCookie(second.refresh)).statusCode).toBe(200);
    t.users.update(DAMIAN_ID, { deletedAt: t.clock.now() });
    expect((await t.refreshWithCookie(second.refresh)).json()).toMatchObject({
      code: 'session_revoked',
    });
    expect((await t.me(second.accessToken)).json()).toMatchObject({ code: 'invalid_token' });
  });

  it('ends a web session 30 days after login despite regular refreshes', async () => {
    const t = await setup();
    const session = await t.signIn(DAMIAN_PHONE);
    let refresh = session.refresh;
    for (let day = 6; day < 30; day += 6) {
      t.clock.advanceSeconds(6 * DAY);
      const res = await t.refreshWithCookie(refresh);
      expect(res.statusCode, `day ${day}`).toBe(200);
      refresh = res.cookies.find((c) => c.name === COOKIE)?.value ?? '';
    }
    // Dzień 24: ciasteczko żyje już tylko do 30. dnia od logowania.
    expect(decodeJwt(refresh).exp).toBe(decodeJwt(session.refresh).iat! + 30 * DAY);
    t.clock.advanceSeconds(6 * DAY);
    expect((await t.refreshWithCookie(refresh)).json()).toMatchObject({ code: 'session_revoked' });
  });

  it('rejects a refresh token signed with another key', async () => {
    const t = await setup();
    const other = await setup();
    const foreign = await other.signIn(DAMIAN_PHONE);
    expect((await t.refreshWithCookie(foreign.refresh)).json()).toMatchObject({
      code: 'session_revoked',
    });
  });
});

describe('auth: JWKS', () => {
  it('serves the signing key only on the jwks port', async () => {
    const t = await setup();
    const session = await t.signIn(DAMIAN_PHONE);
    const jwks = await t.service.internal.jwks?.inject({
      method: 'GET',
      url: '/auth/v1/.well-known/jwks.json',
    });
    expect(jwks?.statusCode).toBe(200);
    expect(jwks?.headers['cache-control']).toBe('public, max-age=300');
    const keys = jwks?.json<{ keys: { kid: string; d?: string }[] }>().keys ?? [];
    expect(keys.map((k) => k.kid)).toEqual([decodeProtectedHeader(session.accessToken).kid]);
    expect(keys[0]).not.toHaveProperty('d');
    const external = await t.inject({ method: 'GET', url: '/auth/v1/.well-known/jwks.json' });
    expect(external.json()).toMatchObject({ status: 404, code: 'not_found' });
  });

  it('lets another service verify access tokens with lib/auth and the JWKS over HTTP', async () => {
    const t = await setup({ port: 0, jwksPort: 0 });
    const addresses = await t.service.listen();
    try {
      const session = await t.signIn(DAMIAN_PHONE);
      const verifier = createAccessTokenVerifier({
        issuer: ISSUER,
        clock: t.clock,
        keys: { jwksUrl: `${addresses.internal.jwks}/auth/v1/.well-known/jwks.json` },
      });
      expect(await verifier.isReady()).toBe(true);
      await expect(verifier.verify(session.accessToken)).resolves.toMatchObject({
        userId: DAMIAN_ID,
        clientId: 'web',
        businesses: [],
      });
      await expect(verifier.verify(session.refresh)).rejects.toMatchObject({
        code: 'invalid_token',
      });
      const otherService = await fetch(`${addresses.external}/auth/v1/.well-known/jwks.json`);
      expect(otherService.status).toBe(404);
    } finally {
      await t.service.close();
    }
  });
});

describe('auth: grants in tokens', () => {
  it('puts businesses into the access token and /me', async () => {
    const t = await setup();
    const business = '0199c6a0-0000-7000-8000-0000000000b1';
    t.access.set(DAMIAN_ID, { businesses: [business], memberships: [], platformRole: null });
    const session = await t.signIn(DAMIAN_PHONE);
    expect(decodeJwt(session.accessToken).biz).toEqual([business]);
    expect((await t.me(session.accessToken)).json()).toMatchObject({ businesses: [business] });
  });
});

describe('auth: setup without fake helpers', () => {
  it('builds with an empty identity provider', async () => {
    const clock = createFakeClock();
    const service = await buildAuthApp({
      config: {
        appEnv: 'test',
        issuer: ISSUER,
        allowedOrigins: [],
        host: '127.0.0.1',
        port: 0,
        jwksPort: 0,
        trustProxy: [],
        rateLimitFactor: 1,
        credentialCheckMinMs: 0,
      },
      logger: createLogger({ service: 'auth', level: 'silent' }),
      clock,
      signer: await createSigner(generateEphemeralSigningKey()),
      idp: new FakeIdentityProvider(clock),
      codes: createMemoryCodeSender(),
      users: new MemoryUserRepository(),
      access: new MemoryAccessRepository(),
    });
    expect(service.routes.map((r) => r.operationId)).toContain('getJwks');
  });
});
