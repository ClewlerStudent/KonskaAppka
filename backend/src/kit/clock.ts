/** Źródło czasu wstrzykiwane do kodu, który liczy wygasanie (tokeny, kody, limity). */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

/** Sekundy od epoki (NumericDate w JWT). */
export function epochSeconds(clock: Clock): number {
  return Math.floor(clock.now().getTime() / 1000);
}

export interface FakeClock extends Clock {
  set(at: Date | number): void;
  advance(ms: number): void;
  advanceSeconds(seconds: number): void;
}

/** Zegar testowy; domyślnie wtorek 13.10.2026, 07:15 czasu polskiego. */
export function createFakeClock(start: Date | number = Date.UTC(2026, 9, 13, 5, 15)): FakeClock {
  let current = new Date(start).getTime();
  return {
    now: () => new Date(current),
    set: (at) => {
      current = new Date(at).getTime();
    },
    advance: (ms) => {
      current += ms;
    },
    advanceSeconds: (seconds) => {
      current += seconds * 1000;
    },
  };
}
