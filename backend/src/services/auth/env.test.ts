import { describe, expect, it } from 'vitest';
import { EnvError, loadEnv } from '../../kit/env.js';
import { authEnvSchema } from './env.js';

const dev = {
  APP_ENV: 'dev',
  AUTH_ISSUER: 'http://localhost:4010/auth/v1',
  ALLOWED_ORIGINS: 'http://localhost:5173',
  SIGNING_KEY_FILE: '.local/signing-key.pem',
  IDP: 'fake',
  CODE_SENDER: 'dev-inbox',
  DEV_INBOX_FILE: '.local/inbox.jsonl',
  DEV_DEMO_PASSWORD: 'tajne-haslo-demo',
};

function problems(source: NodeJS.ProcessEnv): readonly string[] {
  try {
    loadEnv(authEnvSchema, source);
    return [];
  } catch (error) {
    if (error instanceof EnvError) return error.problems;
    throw error;
  }
}

describe('authEnvSchema', () => {
  it('accepts the dev setup from npm run dev:setup', () => {
    expect(loadEnv(authEnvSchema, dev)).toMatchObject({ PORT: 8080, JWKS_PORT: 8081, IDP: 'fake' });
  });

  it('refuses to start prod with dev adapters', () => {
    const list = problems({
      ...dev,
      APP_ENV: 'prod',
      SIGNING_KEY_FILE: undefined,
      SIGNING_KEY_EPHEMERAL: 'true',
    });
    expect(list).toEqual(
      expect.arrayContaining([
        'SIGNING_KEY_EPHEMERAL: not allowed when APP_ENV=prod',
        'IDP: not allowed when APP_ENV=prod',
        'CODE_SENDER: not allowed when APP_ENV=prod',
      ]),
    );
    expect(list.join('\n')).not.toContain('tajne-haslo-demo');
  });

  it('needs exactly one signing key source and the settings of the chosen adapters', () => {
    expect(problems({ ...dev, SIGNING_KEY_PEM: 'x' })).toEqual([
      'SIGNING_KEY_FILE: set exactly one of SIGNING_KEY_FILE, SIGNING_KEY_PEM, SIGNING_KEY_EPHEMERAL=true',
    ]);
    expect(problems({ ...dev, DEV_DEMO_PASSWORD: undefined, DEV_INBOX_FILE: undefined })).toEqual([
      'DEV_DEMO_PASSWORD: required when IDP=fake',
      'DEV_INBOX_FILE: required when CODE_SENDER=dev-inbox',
    ]);
    expect(problems({ ...dev, IDP: 'zitadel' })).toEqual([
      'ZITADEL_API_URL: required when IDP=zitadel',
      'ZITADEL_SERVICE_KEY_FILE: required when IDP=zitadel',
    ]);
    expect(problems({ ...dev, PORT: '4010', JWKS_PORT: '4010' })).toEqual([
      'JWKS_PORT: must differ from PORT',
    ]);
  });
});
