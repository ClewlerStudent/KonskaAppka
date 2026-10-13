import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createAccessTokenVerifier } from '../lib/auth/verify.js';
import { createFakeClock, epochSeconds } from './clock.js';
import { createLogger } from './logger.js';
import { ApiError } from './problem.js';
import { defineRoute } from './route.js';
import { createService, type ServiceOptions } from './service.js';
import { accessClaims, createTestKey, TEST_ISSUER } from './test-keys.test-support.js';

const Ok = z.object({ ok: z.boolean() });
const PANEL = 'http://localhost:5173';

const getThing = defineRoute({
  operationId: 'getThing',
  method: 'GET',
  path: '/test/v1/things',
  summary: 'zewnętrzna',
  responses: { 200: { description: 'ok', schema: Ok } },
  errors: ['invalid_token', 'token_expired'],
});

const echo = defineRoute({
  kind: 'open',
  operationId: 'echo',
  method: 'POST',
  path: '/test/v1/echo',
  summary: 'otwarta',
  open: {
    reason: 'test',
    rateLimit: [
      { by: 'ip', max: 5, windowSec: 60 },
      { by: 'login', max: 2, windowSec: 60 },
    ],
  },
  body: z.object({
    login: z.string(),
    n: z.number().int(),
    clientId: z.enum(['web', 'mobile']).optional(),
  }),
  responses: { 200: { description: 'ok', schema: z.object({ n: z.number() }) } },
  errors: ['validation_failed', 'rate_limited'],
});

const ping = defineRoute({
  kind: 'open',
  operationId: 'ping',
  method: 'POST',
  path: '/test/v1/ping',
  summary: 'otwarta bez treści',
  open: { reason: 'test', rateLimit: [{ by: 'ip', max: 100, windowSec: 60 }] },
  responses: { 204: { description: 'ok' } },
  errors: [],
});

const boom = defineRoute({
  operationId: 'boom',
  method: 'GET',
  path: '/test/v1/boom',
  summary: 'wyjątek',
  responses: { 200: { description: 'ok', schema: Ok } },
  errors: [],
});

const broken = defineRoute({
  operationId: 'broken',
  method: 'GET',
  path: '/test/v1/broken',
  summary: 'odpowiedź niezgodna z kontraktem',
  responses: { 200: { description: 'ok', schema: Ok } },
  errors: [],
});

const leaky = defineRoute({
  operationId: 'leaky',
  method: 'GET',
  path: '/test/v1/leaky',
  summary: 'odpowiedź z polami spoza kontraktu',
  responses: {
    200: { description: 'ok', schema: z.object({ ok: z.boolean(), items: z.array(Ok) }) },
  },
  errors: [],
});

const internalPing = defineRoute({
  kind: 'internal',
  operationId: 'internalPing',
  method: 'GET',
  path: '/test/v1/internal/ping',
  summary: 'wewnętrzna',
  internal: { port: 'ops', callers: ['auth'] },
  responses: { 200: { description: 'ok', schema: Ok } },
  errors: [],
});

async function setup(overrides: Partial<ServiceOptions> = {}) {
  const clock = createFakeClock();
  const key = await createTestKey();
  const verifier = createAccessTokenVerifier({
    issuer: TEST_ISSUER,
    clock,
    keys: { jwks: { keys: [key.publicJwk] } },
  });
  const service = await createService({
    name: 'test',
    appEnv: 'test',
    logger: createLogger({ service: 'test', level: 'silent' }),
    host: '127.0.0.1',
    port: 0,
    internalPorts: { ops: 0 },
    allowedOrigins: [PANEL],
    clock,
    bodyLimit: 1024,
    verifier,
    ...overrides,
  });
  service.route(getThing, ({ principal }) =>
    Promise.resolve({ status: 200, body: { ok: principal.userId.length > 0 } }),
  );
  service.route(echo, ({ body }) => Promise.resolve({ status: 200, body: { n: body.n } }));
  service.route(ping, () => Promise.resolve({ status: 204, body: undefined }));
  service.route(boom, () => Promise.reject(new Error('sekretny szczegół')));
  service.route(broken, () =>
    Promise.resolve({ status: 200, body: { ok: 'tak' } as unknown as { ok: boolean } }),
  );
  service.route(leaky, () => {
    const body = { ok: true, secret: 'tajne-pole', items: [{ ok: true, tokenVersion: 3 }] };
    return Promise.resolve({ status: 200, body });
  });
  service.route(internalPing, () => Promise.resolve({ status: 200, body: { ok: true } }));
  await service.ready();
  const token = (patch: Record<string, unknown> = {}) =>
    key.sign(accessClaims(epochSeconds(clock), patch));
  return { service, clock, token, inject: service.external.inject.bind(service.external) };
}

const json = (body: unknown) => ({
  headers: { 'content-type': 'application/json' },
  payload: JSON.stringify(body),
});

describe('createService: route kinds', () => {
  it('requires an access token on external routes by default', async () => {
    const { inject, token, clock } = await setup();
    const none = await inject({ method: 'GET', url: '/test/v1/things' });
    expect(none.statusCode).toBe(401);
    expect(none.headers['content-type']).toBe('application/problem+json; charset=utf-8');
    expect(none.headers['www-authenticate']).toContain('Bearer');
    expect(none.json()).toMatchObject({ code: 'invalid_token', status: 401 });

    const valid = await inject({
      method: 'GET',
      url: '/test/v1/things',
      headers: { authorization: `Bearer ${await token()}` },
    });
    expect(valid.statusCode).toBe(200);
    expect(valid.json()).toEqual({ ok: true });

    const old = await token();
    clock.advanceSeconds(301);
    const expired = await inject({
      method: 'GET',
      url: '/test/v1/things',
      headers: { authorization: `Bearer ${old}` },
    });
    expect(expired.json()).toMatchObject({ code: 'token_expired' });
  });

  it('serves internal routes only on their own port', async () => {
    const { service, inject } = await setup();
    expect((await inject({ method: 'GET', url: '/test/v1/internal/ping' })).json()).toMatchObject({
      status: 404,
      code: 'not_found',
    });
    const internal = service.internal.ops;
    expect(internal).toBeDefined();
    const res = await internal?.inject({ method: 'GET', url: '/test/v1/internal/ping' });
    expect(res?.statusCode).toBe(200);
    // Port wewnętrzny nie ma tras zewnętrznych ani sond.
    expect((await internal?.inject({ method: 'GET', url: '/test/v1/things' }))?.statusCode).toBe(
      404,
    );
  });

  it('rejects an external route on a service without a verifier', async () => {
    const service = await createService({
      name: 'test',
      appEnv: 'test',
      logger: createLogger({ service: 'test', level: 'silent' }),
      host: '127.0.0.1',
      port: 0,
      allowedOrigins: [],
    });
    expect(() =>
      service.route(getThing, () => Promise.resolve({ status: 200, body: { ok: true } })),
    ).toThrow(/verifier/);
    expect(() =>
      service.route(internalPing, () => Promise.resolve({ status: 200, body: { ok: true } })),
    ).toThrow(/internal port/);
  });
});

describe('createService: problem+json', () => {
  it('reports validation errors without request values', async () => {
    const { inject } = await setup();
    const res = await inject({
      method: 'POST',
      url: '/test/v1/echo',
      ...json({ login: 'a', n: 'tajna-wartosc-123' }),
    });
    expect(res.statusCode).toBe(400);
    const body = res.json<{ code: string; errors: { path: string }[] }>();
    expect(body.code).toBe('validation_failed');
    expect(body.errors.map((e) => e.path)).toEqual(['body.n']);
    expect(res.body).not.toContain('tajna-wartosc-123');
  });

  it('maps parser errors to 400, 413 and 415 without echoing the payload', async () => {
    const { inject } = await setup();
    const badJson = await inject({
      method: 'POST',
      url: '/test/v1/echo',
      headers: { 'content-type': 'application/json' },
      payload: '{"login": "tajne-haslo",',
    });
    expect(badJson.json()).toMatchObject({ status: 400, code: 'validation_failed' });
    expect(badJson.body).not.toContain('tajne-haslo');

    const tooLarge = await inject({
      method: 'POST',
      url: '/test/v1/echo',
      ...json({ login: 'x'.repeat(2000), n: 1 }),
    });
    expect(tooLarge.json()).toMatchObject({ status: 413, code: 'payload_too_large' });

    const text = await inject({
      method: 'POST',
      url: '/test/v1/echo',
      headers: { 'content-type': 'text/plain' },
      payload: '{"login":"a","n":1}',
    });
    expect(text.json()).toMatchObject({ status: 415, code: 'unsupported_media_type' });
  });

  it('accepts an empty JSON body on a route without a body', async () => {
    const { inject } = await setup();
    const res = await inject({
      method: 'POST',
      url: '/test/v1/ping',
      headers: { 'content-type': 'application/json' },
    });
    expect(res.statusCode).toBe(204);
  });

  it('answers unknown paths with 404 and failures with a bare 500', async () => {
    const { inject, token } = await setup();
    expect((await inject({ method: 'GET', url: '/nope' })).json()).toMatchObject({
      status: 404,
      code: 'not_found',
    });
    const auth = { authorization: `Bearer ${await token()}` };
    const thrown = await inject({ method: 'GET', url: '/test/v1/boom', headers: auth });
    expect(thrown.json()).toEqual({
      type: 'urn:equenor:problem:internal_error',
      title: 'Internal error',
      status: 500,
      code: 'internal_error',
    });
    const broken = await inject({ method: 'GET', url: '/test/v1/broken', headers: auth });
    expect(broken.json()).toMatchObject({ status: 500, code: 'internal_error' });
  });

  it('never sends fields outside the contract: 500 outside prod, stripped and logged in prod', async () => {
    const test = await setup();
    const auth = { authorization: `Bearer ${await test.token()}` };
    const failed = await test.inject({ method: 'GET', url: '/test/v1/leaky', headers: auth });
    expect(failed.json()).toMatchObject({ status: 500, code: 'internal_error' });
    expect(failed.body).not.toContain('tajne-pole');

    const lines: string[] = [];
    const prod = await setup({
      appEnv: 'prod',
      logger: createLogger(
        { service: 'test', level: 'info' },
        { write: (line) => lines.push(line) },
      ),
    });
    const res = await prod.inject({
      method: 'GET',
      url: '/test/v1/leaky',
      headers: { authorization: `Bearer ${await prod.token()}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true, items: [{ ok: true }] });
    const logged = lines.find((line) => line.includes('outside the contract'));
    expect(logged).toContain('"extraFields":["secret","items.0.tokenVersion"]');
    expect(lines.join('\n')).not.toContain('tajne-pole');
  });

  it('turns ApiError into its status and headers', async () => {
    const service = await createService({
      name: 'test',
      appEnv: 'test',
      logger: createLogger({ service: 'test', level: 'silent' }),
      host: '127.0.0.1',
      port: 0,
      allowedOrigins: [],
    });
    service.route(ping, () =>
      Promise.reject(new ApiError('rate_limited', { headers: { 'retry-after': '7' } })),
    );
    const res = await service.external.inject({ method: 'POST', url: '/test/v1/ping' });
    expect(res.statusCode).toBe(429);
    expect(res.headers['retry-after']).toBe('7');
  });
});

describe('createService: open routes', () => {
  it('limits by IP and by login with Retry-After, and resets after the window', async () => {
    const { inject, clock } = await setup();
    const call = (login: string) =>
      inject({ method: 'POST', url: '/test/v1/echo', ...json({ login, n: 1 }) });
    expect((await call('Ola')).statusCode).toBe(200);
    expect((await call(' ola ')).statusCode).toBe(200);
    const limited = await call('OLA');
    expect(limited.statusCode).toBe(429);
    expect(limited.json()).toMatchObject({ code: 'rate_limited' });
    expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);

    expect((await call('anna')).statusCode).toBe(200);
    expect((await call('marta')).statusCode).toBe(200);
    // Szóste żądanie z tego IP w oknie.
    expect((await call('piotr')).statusCode).toBe(429);

    clock.advanceSeconds(60);
    expect((await call('ola')).statusCode).toBe(200);
  });

  it('scales limits with rateLimitFactor', async () => {
    const { inject } = await setup({ rateLimitFactor: 2 });
    for (let i = 0; i < 4; i++) {
      const res = await inject({
        method: 'POST',
        url: '/test/v1/echo',
        ...json({ login: 'a', n: i }),
      });
      expect(res.statusCode).toBe(200);
    }
  });

  it('accepts browser requests only from listed origins with X-Equenor-Client: web', async () => {
    const { inject } = await setup();
    const call = (headers: Record<string, string>, body: unknown = { login: 'a', n: 1 }) =>
      inject({
        method: 'POST',
        url: '/test/v1/echo',
        headers: { 'content-type': 'application/json', ...headers },
        payload: JSON.stringify(body),
      });
    expect(
      (await call({ origin: 'https://evil.example', 'x-equenor-client': 'web' })).json(),
    ).toMatchObject({ status: 403, code: 'origin_not_allowed' });
    expect((await call({ origin: PANEL })).json()).toMatchObject({ code: 'origin_not_allowed' });
    expect(
      (
        await call(
          { origin: PANEL, 'x-equenor-client': 'web' },
          { login: 'a', n: 1, clientId: 'mobile' },
        )
      ).json(),
    ).toMatchObject({ status: 403, code: 'client_not_allowed' });
    const ok = await call({ origin: PANEL, 'x-equenor-client': 'web' });
    expect(ok.statusCode).toBe(200);
    expect(ok.headers['access-control-allow-origin']).toBe(PANEL);
    expect(ok.headers['access-control-allow-credentials']).toBe('true');
    // Bez Origin (apka, CLI) bez dodatkowych warunków.
    expect((await call({}, { login: 'b', n: 1, clientId: 'mobile' })).statusCode).toBe(200);
  });

  it('answers CORS preflight only for listed origins', async () => {
    const { inject } = await setup();
    const preflight = (origin: string) =>
      inject({
        method: 'OPTIONS',
        url: '/test/v1/echo',
        headers: {
          origin,
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type,x-equenor-client',
        },
      });
    const allowed = await preflight(PANEL);
    expect(allowed.statusCode).toBe(204);
    expect(allowed.headers['access-control-allow-origin']).toBe(PANEL);
    expect(allowed.headers['access-control-allow-credentials']).toBe('true');
    expect(String(allowed.headers['access-control-allow-headers'])).toContain('x-equenor-client');
    const denied = await preflight('https://evil.example');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('createService: probes and headers', () => {
  it('serves /livez and /readyz', async () => {
    let ready = true;
    const { service, inject } = await setup({ isReady: () => ready });
    expect((await inject({ method: 'GET', url: '/livez' })).json()).toEqual({ status: 'ok' });
    expect((await inject({ method: 'GET', url: '/readyz' })).statusCode).toBe(200);
    ready = false;
    expect((await inject({ method: 'GET', url: '/readyz' })).json()).toMatchObject({
      status: 503,
      code: 'not_ready',
    });
    expect(service.isClosing()).toBe(false);
    await service.close();
    expect(service.isClosing()).toBe(true);
  });

  it('propagates a UUID X-Request-Id and sets no-store by default', async () => {
    const { inject } = await setup();
    const id = '0199c6a0-0000-7000-8000-00000000abcd';
    const kept = await inject({ method: 'GET', url: '/livez', headers: { 'x-request-id': id } });
    expect(kept.headers['x-request-id']).toBe(id);
    expect(kept.headers['cache-control']).toBe('no-store');
    expect(kept.headers['x-content-type-options']).toBe('nosniff');
    const replaced = await inject({
      method: 'GET',
      url: '/livez',
      headers: { 'x-request-id': 'nie-uuid\nwstrzykniecie' },
    });
    expect(replaced.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('listens on the external and internal ports', async () => {
    const { service } = await setup();
    const addresses = await service.listen();
    try {
      expect(addresses.external).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
      const res = await fetch(`${addresses.internal.ops}/test/v1/internal/ping`);
      expect(await res.json()).toEqual({ ok: true });
    } finally {
      await service.close();
    }
  });
});
