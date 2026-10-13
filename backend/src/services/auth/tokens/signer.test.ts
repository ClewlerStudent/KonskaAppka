import { generateKeyPairSync } from 'node:crypto';
import { calculateJwkThumbprint, decodeProtectedHeader } from 'jose';
import { describe, expect, it } from 'vitest';
import { createSigner, generateEphemeralSigningKey, loadSigningKey } from './signer.js';

const pem = () =>
  generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  }).privateKey;

describe('signer', () => {
  it('uses the RFC 7638 thumbprint as kid and publishes only the public key', async () => {
    const signer = await createSigner(generateEphemeralSigningKey());
    const [jwk] = signer.publicJwks().keys;
    expect(jwk).toMatchObject({ kty: 'EC', crv: 'P-256', alg: 'ES256', use: 'sig' });
    expect(jwk).not.toHaveProperty('d');
    expect(signer.kid).toBe(
      await calculateJwkThumbprint({ kty: 'EC', crv: 'P-256', x: jwk?.x, y: jwk?.y }),
    );
    const token = await signer.sign('at+jwt', { sub: 'x' });
    expect(decodeProtectedHeader(token)).toEqual({ alg: 'ES256', typ: 'at+jwt', kid: signer.kid });
  });

  it('loads a PKCS#8 PEM, also with escaped newlines from env', async () => {
    const text = pem();
    const fromFile = await createSigner(loadSigningKey(text));
    const fromEnv = await createSigner(loadSigningKey(text.replaceAll('\n', '\\n')));
    expect(fromEnv.kid).toBe(fromFile.kid);
  });

  it('refuses keys other than EC P-256', () => {
    const rsa = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    }).privateKey;
    const p384 = generateKeyPairSync('ec', {
      namedCurve: 'P-384',
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    }).privateKey;
    expect(() => loadSigningKey(rsa)).toThrow(/P-256/);
    expect(() => loadSigningKey(p384)).toThrow(/P-256/);
  });
});
