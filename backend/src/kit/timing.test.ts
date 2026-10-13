import { describe, expect, it } from 'vitest';
import { atLeast, sleep } from './timing.js';

describe('atLeast', () => {
  it('waits out the rest of the floor after fast work, also when the work throws', async () => {
    const waits: number[] = [];
    const wait = (ms: number) => {
      waits.push(ms);
      return Promise.resolve();
    };
    await expect(atLeast(300, () => Promise.resolve('ok'), wait)).resolves.toBe('ok');
    await expect(atLeast(300, () => Promise.reject(new Error('nie')), wait)).rejects.toThrow('nie');
    expect(waits).toHaveLength(2);
    for (const ms of waits) {
      expect(ms).toBeGreaterThan(250);
      expect(ms).toBeLessThanOrEqual(300);
    }
  });

  it('does not wait when the work took longer than the floor or the floor is 0', async () => {
    const waits: number[] = [];
    const wait = (ms: number) => {
      waits.push(ms);
      return Promise.resolve();
    };
    await atLeast(5, () => sleep(20), wait);
    await atLeast(0, () => Promise.resolve(), wait);
    expect(waits).toEqual([]);
  });
});
