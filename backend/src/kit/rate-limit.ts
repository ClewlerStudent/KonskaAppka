import type { Clock } from './clock.js';

/**
 * Limiter z oknem stałym w pamięci procesu (jedna replika). Limity na brzegu (WAF, Ingress)
 * i licznik współdzielony między replikami dojdą później.
 */
export interface RateCheck {
  readonly key: string;
  readonly max: number;
  readonly windowSec: number;
}

export type RateResult =
  { readonly ok: true } | { readonly ok: false; readonly retryAfterSec: number };

export interface RateLimiter {
  /** Liczy jedno żądanie we wszystkich kluczach; odmowa, gdy którykolwiek przekroczył limit. */
  hit(checks: readonly RateCheck[]): RateResult;
  size(): number;
}

interface Bucket {
  windowEnd: number;
  count: number;
}

export interface RateLimiterOptions {
  /** Górna granica liczby kluczy w pamięci; po przekroczeniu wypadają najstarsze. */
  readonly maxKeys?: number;
}

export function createRateLimiter(clock: Clock, options: RateLimiterOptions = {}): RateLimiter {
  const maxKeys = options.maxKeys ?? 100_000;
  const buckets = new Map<string, Bucket>();
  let hitsSinceSweep = 0;

  const sweep = (now: number) => {
    for (const [key, bucket] of buckets) if (bucket.windowEnd <= now) buckets.delete(key);
    for (const key of buckets.keys()) {
      if (buckets.size <= maxKeys) break;
      buckets.delete(key);
    }
  };

  return {
    hit(checks) {
      const now = clock.now().getTime();
      if (++hitsSinceSweep >= 1000 || buckets.size > maxKeys) {
        hitsSinceSweep = 0;
        sweep(now);
      }

      let retryAfterMs = 0;
      for (const check of checks) {
        const windowMs = check.windowSec * 1000;
        const id = `${check.windowSec}|${check.key}`;
        let bucket = buckets.get(id);
        if (!bucket || bucket.windowEnd <= now) {
          // Okno wyrównane do epoki: ten sam podział czasu w każdej replice.
          bucket = { windowEnd: (Math.floor(now / windowMs) + 1) * windowMs, count: 0 };
          buckets.set(id, bucket);
        }
        bucket.count += 1;
        if (bucket.count > check.max) {
          retryAfterMs = Math.max(retryAfterMs, bucket.windowEnd - now);
        }
      }

      return retryAfterMs > 0
        ? { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) }
        : { ok: true };
    },
    size: () => buckets.size,
  };
}
