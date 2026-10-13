import { describe, expect, it } from 'vitest';
import { createLogger } from './logger.js';

describe('createLogger', () => {
  it('redacts secrets in logged objects and request headers', () => {
    const lines: string[] = [];
    const logger = createLogger(
      { service: 'test', level: 'info' },
      { write: (l) => lines.push(l) },
    );
    logger.info(
      {
        password: 'haslo-1',
        body: { password: 'haslo-2', code: '123456', loginToken: 'lt', refreshToken: 'rt' },
        reply: { accessToken: 'at' },
        req: { headers: { authorization: 'Bearer tok', cookie: '__Secure-eq_rt=rt2' } },
      },
      'x',
    );
    const text = lines.join('');
    for (const secret of ['haslo-1', 'haslo-2', '123456', '"lt"', '"rt"', '"at"', 'tok', 'rt2']) {
      expect(text).not.toContain(secret);
    }
    expect(JSON.parse(text)).toMatchObject({ service: 'test', level: 'info', msg: 'x' });
  });
});
