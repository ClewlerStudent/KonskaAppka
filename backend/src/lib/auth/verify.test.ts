import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { SignJWT, type JWK } from 'jose';
import { afterEach, describe, expect, it } from 'vitest';
import { createFakeClock, epochSeconds } from '../../kit/clock.js';
import {
  accessClaims,
  createTestKey,
  TEST_ISSUER,
  type TestKey,
} from '../../kit/test-keys.test-support.js';
import { createAccessTokenVerifier, TokenError } from './verify.js';

async function setup() {
  const clock = createFakeClock();
  const key = await createTestKey();
  const verifier = createAccessTokenVerifier({
    issuer: TEST_ISSUER,
    clock,
    keys: { jwks: { keys: [key.publicJwk] } },
  });
  const now = epochSeconds(clock);
  return { clock, key, verifier, now };
}

async function rejection(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof TokenError) return error.code;
    throw error;
  }
  return 'accepted';
}

describe('createAccessTokenVerifier', () => {
  it('returns the principal of a valid access token', async () => {
    const { key, verifier, now } = await setup();
    const token = await key.sign(
      accessClaims(now, {
        biz: ['0199c6a0-0000-7000-8000-0000000000b1'],
        extra: 'ignored',
      }),
    );
    const principal = await verifier.verify(token);
    expect(principal).toMatchObject({
      userId: '0199c6a0-0000-7000-8000-000000000001',
      clientId: 'web',
      amr: ['pwd', 'otp'],
      businesses: ['0199c6a0-0000-7000-8000-0000000000b1'],
      memberships: [],
      platformRole: null,
    });
  });

  it('reports expiry as token_expired', async () => {
    const { key, verifier, now, clock } = await setup();
    const token = await key.sign(accessClaims(now));
    clock.advanceSeconds(300);
    expect(await rejection(verifier.verify(token))).toBe('token_expired');
  });

  it.each<[string, (key: TestKey, now: number) => Promise<string>]>([
    ['refresh token type', (k, n) => k.sign(accessClaims(n), { typ: 'rt+jwt' })],
    ['login token type', (k, n) => k.sign(accessClaims(n), { typ: 'login+jwt' })],
    ['auth audience', (k, n) => k.sign(accessClaims(n, { aud: 'equenor-auth' }))],
    ['other issuer', (k, n) => k.sign(accessClaims(n, { iss: 'https://evil.example/auth/v1' }))],
    ['iat over 60 s in the future', (k, n) => k.sign(accessClaims(n + 61))],
    ['lifetime over 5 min', (k, n) => k.sign(accessClaims(n, { exp: n + 301 }))],
    ['claims version 2', (k, n) => k.sign(accessClaims(n, { ver: 2 }))],
    ['missing jti', (k, n) => k.sign(accessClaims(n, { jti: undefined }))],
    [
      'HS256',
      (_k, n) =>
        new SignJWT(accessClaims(n))
          .setProtectedHeader({ alg: 'HS256', typ: 'at+jwt' })
          .sign(new TextEncoder().encode('x'.repeat(32))),
    ],
    [
      'foreign key',
      async (_k, n) => {
        const other = await createTestKey();
        return other.sign(accessClaims(n));
      },
    ],
    ['garbage', () => Promise.resolve('a.b.c')],
  ])('rejects %s as invalid_token', async (_name, make) => {
    const { key, verifier, now } = await setup();
    expect(await rejection(verifier.verify(await make(key, now)))).toBe('invalid_token');
  });

  it('accepts iat up to 60 s in the future (clock skew)', async () => {
    const { key, verifier, now } = await setup();
    await expect(verifier.verify(await key.sign(accessClaims(now + 60)))).resolves.toBeDefined();
  });
});

describe('createAccessTokenVerifier with a remote JWKS', () => {
  let server: Server | undefined;
  afterEach(async () => {
    const current = server;
    server = undefined;
    if (!current) return;
    current.closeAllConnections();
    await new Promise((resolve) => current.close(resolve));
  });

  async function serveJwks(keys: () => JWK[]) {
    let fetches = 0;
    server = createServer((_req, res) => {
      fetches += 1;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ keys: keys() }));
    });
    await new Promise<void>((resolve) => server?.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;
    return {
      url: `http://127.0.0.1:${port}/auth/v1/.well-known/jwks.json`,
      fetches: () => fetches,
    };
  }

  it('fetches keys once and refetches on an unknown kid', async () => {
    const clock = createFakeClock(Date.now());
    const first = await createTestKey();
    const second = await createTestKey();
    let published = [first.publicJwk];
    const jwks = await serveJwks(() => published);
    const verifier = createAccessTokenVerifier({
      issuer: TEST_ISSUER,
      clock,
      keys: { jwksUrl: jwks.url, cooldownMs: 0 },
    });
    const now = epochSeconds(clock);

    expect(await verifier.isReady()).toBe(true);
    await verifier.verify(await first.sign(accessClaims(now)));
    await verifier.verify(await first.sign(accessClaims(now)));
    expect(jwks.fetches()).toBe(1);

    published = [first.publicJwk, second.publicJwk];
    await verifier.verify(await second.sign(accessClaims(now)));
    expect(jwks.fetches()).toBe(2);
  });

  it('is not ready while the JWKS is unreachable', async () => {
    const verifier = createAccessTokenVerifier({
      issuer: TEST_ISSUER,
      keys: { jwksUrl: 'http://127.0.0.1:9/auth/v1/.well-known/jwks.json', timeoutMs: 500 },
    });
    expect(await verifier.isReady()).toBe(false);
  });
});
