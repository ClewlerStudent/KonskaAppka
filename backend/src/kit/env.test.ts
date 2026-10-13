import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { baseEnvSchema, EnvError, loadEnv, refineBaseEnv } from './env.js';

const schema = baseEnvSchema.superRefine(refineBaseEnv);
const valid = { APP_ENV: 'dev', ALLOWED_ORIGINS: 'http://localhost:5173, http://localhost:5174' };

function problemsOf(source: NodeJS.ProcessEnv, s: z.ZodType = schema): readonly string[] {
  try {
    loadEnv(s, source);
  } catch (error) {
    if (error instanceof EnvError) return error.problems;
    throw error;
  }
  return [];
}

describe('loadEnv', () => {
  it('applies defaults and parses lists, numbers and booleans', () => {
    const env = loadEnv(schema, {
      ...valid,
      PORT: '4010',
      TRUST_PROXY: '10.0.0.0/16, 127.0.0.1',
      HOST: '',
    });
    expect(env).toMatchObject({
      APP_ENV: 'dev',
      PORT: 4010,
      HOST: '0.0.0.0',
      TRUST_PROXY: ['10.0.0.0/16', '127.0.0.1'],
      LOG_PRETTY: false,
      RATE_LIMIT_FACTOR: 1,
      ALLOWED_ORIGINS: ['http://localhost:5173', 'http://localhost:5174'],
    });
  });

  it('names missing and invalid variables without their values', () => {
    const problems = problemsOf({
      ALLOWED_ORIGINS: 'http://localhost:5173/sciezka-z-sekretem',
      PORT: 'tajne-123',
    });
    expect(problems.some((p) => p.startsWith('APP_ENV: required'))).toBe(true);
    expect(problems.some((p) => p.startsWith('PORT:'))).toBe(true);
    expect(problems.some((p) => p.startsWith('ALLOWED_ORIGINS.0:'))).toBe(true);
    expect(problems.join('\n')).not.toMatch(/sekretem|tajne-123/);
  });

  it('takes TRUST_PROXY as proxy addresses and rejects true', () => {
    expect(loadEnv(schema, valid).TRUST_PROXY).toEqual([]);
    expect(loadEnv(schema, { ...valid, TRUST_PROXY: 'false' }).TRUST_PROXY).toEqual([]);
    expect(loadEnv(schema, { ...valid, TRUST_PROXY: 'uniquelocal,fd00::/8' }).TRUST_PROXY).toEqual([
      'uniquelocal',
      'fd00::/8',
    ]);
    for (const value of ['true', '1', '10.0.0.0/33', '10.0.0/8', 'proxy.local']) {
      expect(problemsOf({ ...valid, TRUST_PROXY: value }), value).toEqual([
        'TRUST_PROXY.0: expected an IP address, a CIDR or loopback/linklocal/uniquelocal; true is not allowed',
      ]);
    }
  });

  it('forbids dev-only switches in prod', () => {
    const problems = problemsOf({
      ...valid,
      APP_ENV: 'prod',
      LOG_PRETTY: 'true',
      RATE_LIMIT_FACTOR: '10',
    });
    expect(problems).toEqual([
      'LOG_PRETTY: not allowed when APP_ENV=prod',
      'RATE_LIMIT_FACTOR: not allowed when APP_ENV=prod',
    ]);
  });
});
