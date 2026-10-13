import type { Membership, PlatformRole } from '../../../lib/auth/claims.js';

/** Uprawnienia konta, z których auth wylicza claimy `biz`, `m` i `plt`. */
export interface AccessGrants {
  readonly businesses: readonly string[];
  readonly memberships: readonly Membership[];
  readonly platformRole: PlatformRole | null;
}

export const NO_ACCESS: AccessGrants = { businesses: [], memberships: [], platformRole: null };

export interface AccessRepository {
  forUser(userId: string): Promise<AccessGrants>;
}
