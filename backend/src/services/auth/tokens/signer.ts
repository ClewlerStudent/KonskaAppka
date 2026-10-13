import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  type KeyObject,
} from 'node:crypto';
import { calculateJwkThumbprint, SignJWT, type JWTPayload } from 'jose';
import { SIGNING_ALG } from '../../../lib/auth/constants.js';

/**
 * Klucz podpisu ES256 (P-256): w dev z pliku z `npm run dev:setup`, w produkcji sekret
 * z pliku albo env (KMS i rotacja kluczy później). `kid` to odcisk RFC 7638.
 */

export interface PublicSigningJwk {
  readonly kty: 'EC';
  readonly crv: 'P-256';
  readonly x: string;
  readonly y: string;
  readonly kid: string;
  readonly alg: 'ES256';
  readonly use: 'sig';
}

export interface Signer {
  readonly kid: string;
  sign(typ: string, payload: JWTPayload): Promise<string>;
  publicJwks(): { keys: PublicSigningJwk[] };
}

/** Klucz prywatny PKCS#8 (albo SEC1) w PEM; tylko EC P-256. */
export function loadSigningKey(pem: string): KeyObject {
  // Env często niesie PEM z dosłownymi `\n`.
  const key = createPrivateKey(pem.includes('\\n') ? pem.replaceAll('\\n', '\n') : pem);
  if (key.asymmetricKeyType !== 'ec' || key.asymmetricKeyDetails?.namedCurve !== 'prime256v1') {
    throw new Error('Signing key must be an EC P-256 private key');
  }
  return key;
}

/** Klucz tylko na czas życia procesu (testy, compose); w prod zabroniony. */
export function generateEphemeralSigningKey(): KeyObject {
  return generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey;
}

export async function createSigner(privateKey: KeyObject): Promise<Signer> {
  const jwk = createPublicKey(privateKey).export({ format: 'jwk' });
  if (jwk.kty !== 'EC' || jwk.crv !== 'P-256' || !jwk.x || !jwk.y) {
    throw new Error('Signing key must be an EC P-256 key');
  }
  const kid = await calculateJwkThumbprint({ kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y });
  const publicJwk: PublicSigningJwk = {
    kty: 'EC',
    crv: 'P-256',
    x: jwk.x,
    y: jwk.y,
    kid,
    alg: SIGNING_ALG,
    use: 'sig',
  };

  return {
    kid,
    sign: (typ, payload) =>
      new SignJWT(payload).setProtectedHeader({ alg: SIGNING_ALG, typ, kid }).sign(privateKey),
    publicJwks: () => ({ keys: [publicJwk] }),
  };
}
