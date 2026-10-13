// Pomocnik testów kit i lib/auth (poza buildem: tsconfig.build.json wyklucza *.test-support.ts).
import { calculateJwkThumbprint, exportJWK, generateKeyPair, SignJWT, type JWK } from 'jose';

export interface TestKey {
  readonly kid: string;
  readonly publicJwk: JWK;
  sign(payload: Record<string, unknown>, header?: { typ?: string; alg?: string }): Promise<string>;
}

export async function createTestKey(): Promise<TestKey> {
  const { privateKey, publicKey } = await generateKeyPair('ES256', { extractable: true });
  const jwk = await exportJWK(publicKey);
  const kid = await calculateJwkThumbprint(jwk);
  return {
    kid,
    publicJwk: { ...jwk, kid, alg: 'ES256', use: 'sig' },
    sign: (payload, header = {}) =>
      new SignJWT(payload)
        .setProtectedHeader({ alg: header.alg ?? 'ES256', typ: header.typ ?? 'at+jwt', kid })
        .sign(privateKey),
  };
}

export const TEST_ISSUER = 'http://localhost:4010/auth/v1';

/** Claimy poprawnego access tokenu wydanego w chwili `iat`. */
export function accessClaims(iat: number, patch: Record<string, unknown> = {}) {
  return {
    iss: TEST_ISSUER,
    aud: 'equenor-api',
    sub: '0199c6a0-0000-7000-8000-000000000001',
    sid: '0199c6a0-0000-7000-8000-0000000000a1',
    client_id: 'web',
    iat,
    exp: iat + 300,
    jti: '0199c6a0-0000-7000-8000-0000000000e1',
    ver: 1,
    amr: ['pwd', 'otp'],
    auth_time: iat,
    ...patch,
  };
}
