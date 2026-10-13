import type { ClientId } from '../../../contracts/common.js';
import type { AccessClaims } from '../../../lib/auth/claims.js';
import { ACCESS_AUD, ACCESS_TTL_S, CLAIMS_VERSION } from '../../../lib/auth/constants.js';
import type { AccessGrants } from '../access/access-repository.js';
import type { User } from '../users/user-repository.js';
import type { SessionKind } from './lifetimes.js';

/** Rodzaj sesji: konto techniczne ma dokładnie jedno członkostwo z rolą `tablet` albo `display`. */
export function sessionKindOf(user: User, grants: AccessGrants): SessionKind {
  if (user.accountKind !== 'technical') return 'person';
  const role = grants.memberships[0]?.r;
  return role === 'tablet' || role === 'display' ? role : 'person';
}

/**
 * Zgodność konta z aplikacją (docs/mikroserwisy.md 3.1), inaczej 403 wrong_client:
 * konto `tablet` tylko aplikacją `tablet` (osoba nigdy), konto `display` tylko `web`,
 * konto zespołu nie loguje się aplikacjami klientów.
 */
export function isClientAllowed(user: User, grants: AccessGrants, clientId: ClientId): boolean {
  if (user.identityPool !== 'customer') return false;
  switch (sessionKindOf(user, grants)) {
    case 'tablet':
      return clientId === 'tablet';
    case 'display':
      return clientId === 'web';
    case 'person':
      return clientId !== 'tablet';
  }
}

export interface AccessClaimsInput {
  readonly issuer: string;
  readonly userId: string;
  readonly clientId: ClientId;
  readonly sid: string;
  /** Start sesji (krok MFA); przy odświeżeniu przechodzi bez zmian. */
  readonly authTime: number;
  readonly iat: number;
  readonly jti: string;
  readonly grants: AccessGrants;
}

/** Claimy access tokenu; `biz`, `m` i `plt` tylko gdy niepuste (budżet rozmiaru, 3.2). */
export function computeAccessClaims(input: AccessClaimsInput): AccessClaims {
  const { grants } = input;
  return {
    iss: input.issuer,
    aud: ACCESS_AUD,
    sub: input.userId,
    sid: input.sid,
    client_id: input.clientId,
    iat: input.iat,
    exp: input.iat + ACCESS_TTL_S,
    jti: input.jti,
    ver: CLAIMS_VERSION,
    amr: ['pwd', 'otp'],
    auth_time: input.authTime,
    ...(grants.businesses.length > 0 ? { biz: [...grants.businesses] } : {}),
    ...(grants.memberships.length > 0 ? { m: [...grants.memberships] } : {}),
    ...(grants.platformRole ? { plt: grants.platformRole } : {}),
  };
}
