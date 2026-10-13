import { describe, expect, it } from 'vitest';
import { createFakeClock } from './clock.js';
import { createRateLimiter } from './rate-limit.js';

describe('createRateLimiter', () => {
  it('counts a fixed window per key and reports Retry-After until the window ends', () => {
    const clock = createFakeClock(Date.UTC(2026, 9, 13, 5, 15, 0));
    const limiter = createRateLimiter(clock);
    const check = [{ key: 'login|ola', max: 2, windowSec: 60 }];
    expect(limiter.hit(check)).toEqual({ ok: true });
    expect(limiter.hit(check)).toEqual({ ok: true });
    clock.advanceSeconds(15);
    expect(limiter.hit(check)).toEqual({ ok: false, retryAfterSec: 45 });
    // Inny klucz ma osobny licznik.
    expect(limiter.hit([{ key: 'login|anna', max: 2, windowSec: 60 }])).toEqual({ ok: true });
    clock.advanceSeconds(45);
    expect(limiter.hit(check)).toEqual({ ok: true });
  });

  it('refuses when any key is over its limit and reports the longest wait', () => {
    const clock = createFakeClock(Date.UTC(2026, 9, 13, 5, 0, 0));
    const limiter = createRateLimiter(clock);
    const checks = [
      { key: 'ip|1', max: 1, windowSec: 60 },
      { key: 'login|ola', max: 1, windowSec: 3600 },
    ];
    expect(limiter.hit(checks).ok).toBe(true);
    expect(limiter.hit(checks)).toEqual({ ok: false, retryAfterSec: 3600 });
  });

  it('keeps memory bounded', () => {
    const clock = createFakeClock();
    const limiter = createRateLimiter(clock, { maxKeys: 10 });
    for (let i = 0; i < 50; i++) limiter.hit([{ key: `ip|${i}`, max: 5, windowSec: 60 }]);
    expect(limiter.size()).toBeLessThanOrEqual(11);
  });
});
