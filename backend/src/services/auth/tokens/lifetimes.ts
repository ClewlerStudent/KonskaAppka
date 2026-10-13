import type { ClientId } from '../../../contracts/common.js';

/**
 * Okna sesji (docs/mikroserwisy.md 3.4): refresh token żyje `idle` od odświeżenia,
 * ale nie dłużej niż `max` od startu sesji (`sst`). `ops` i `opctl` dojdą z panelem zespołu.
 */

export type SessionKind = 'person' | 'display' | 'tablet';

export interface SessionWindow {
  readonly idleSec: number;
  /** null = bez limitu (tablet: do blokady albo „Wyloguj wszystkie tablety”). */
  readonly maxSec: number | null;
}

const DAY = 86_400;

export function sessionWindow(clientId: ClientId, kind: SessionKind): SessionWindow {
  switch (clientId) {
    case 'web':
      return kind === 'display'
        ? { idleSec: 30 * DAY, maxSec: 365 * DAY }
        : { idleSec: 7 * DAY, maxSec: 30 * DAY };
    case 'mobile':
      return { idleSec: 30 * DAY, maxSec: 180 * DAY };
    case 'tablet':
      return { idleSec: 30 * DAY, maxSec: null };
  }
}

/** `exp` refresh tokenu albo null, gdy sesja już przekroczyła maksimum. */
export function refreshExpiry(
  nowSec: number,
  sstSec: number,
  window: SessionWindow,
): number | null {
  const idle = nowSec + window.idleSec;
  const exp = window.maxSec === null ? idle : Math.min(idle, sstSec + window.maxSec);
  return exp > nowSec ? exp : null;
}
