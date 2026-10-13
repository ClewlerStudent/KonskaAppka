import { describe, expect, it } from 'vitest';
import { refreshExpiry, sessionWindow } from './lifetimes.js';

const DAY = 86_400;

describe('session windows', () => {
  it('follow docs/mikroserwisy.md 3.4', () => {
    expect(sessionWindow('web', 'person')).toEqual({ idleSec: 7 * DAY, maxSec: 30 * DAY });
    expect(sessionWindow('web', 'display')).toEqual({ idleSec: 30 * DAY, maxSec: 365 * DAY });
    expect(sessionWindow('mobile', 'person')).toEqual({ idleSec: 30 * DAY, maxSec: 180 * DAY });
    expect(sessionWindow('tablet', 'tablet')).toEqual({ idleSec: 30 * DAY, maxSec: null });
  });

  it('slides the idle window but never past sst + max', () => {
    const web = sessionWindow('web', 'person');
    const sst = 1_791_868_500;
    expect(refreshExpiry(sst, sst, web)).toBe(sst + 7 * DAY);
    expect(refreshExpiry(sst + 25 * DAY, sst, web)).toBe(sst + 30 * DAY);
    expect(refreshExpiry(sst + 30 * DAY, sst, web)).toBeNull();
    const tablet = sessionWindow('tablet', 'tablet');
    expect(refreshExpiry(sst + 900 * DAY, sst, tablet)).toBe(sst + 930 * DAY);
  });
});
