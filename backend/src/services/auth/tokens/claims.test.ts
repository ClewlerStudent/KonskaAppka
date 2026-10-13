import { describe, expect, it } from 'vitest';
import { NO_ACCESS, type AccessGrants } from '../access/access-repository.js';
import type { User } from '../users/user-repository.js';
import { computeAccessClaims, isClientAllowed } from './claims.js';

const user: User = {
  id: '0199c6a0-0000-7000-8000-000000000001',
  identityPool: 'customer',
  idpUserId: 'idp-1',
  accountKind: 'person',
  tokenVersion: 0,
  displayName: 'Damian',
  phoneE164: '+48602000145',
  email: null,
  locale: 'pl',
  contactSyncedAt: new Date(0),
  deletedAt: null,
};
const stable = '0199c6a0-0000-7000-8000-0000000000c1';
const tabletGrants: AccessGrants = {
  ...NO_ACCESS,
  memberships: [{ s: stable, r: 'tablet', f: ['flags'] }],
};

const base = {
  issuer: 'http://localhost:4010/auth/v1',
  userId: user.id,
  clientId: 'web' as const,
  sid: '0199c6a0-0000-7000-8000-0000000000a1',
  authTime: 1_791_868_000,
  iat: 1_791_868_500,
  jti: '0199c6a0-0000-7000-8000-0000000000e1',
};

describe('computeAccessClaims', () => {
  it('omits empty biz, m and plt', () => {
    expect(computeAccessClaims({ ...base, grants: NO_ACCESS })).toEqual({
      iss: base.issuer,
      aud: 'equenor-api',
      sub: user.id,
      sid: base.sid,
      client_id: 'web',
      iat: base.iat,
      exp: base.iat + 300,
      jti: base.jti,
      ver: 1,
      amr: ['pwd', 'otp'],
      auth_time: base.authTime,
    });
  });

  it('includes non-empty grants', () => {
    const claims = computeAccessClaims({
      ...base,
      grants: {
        businesses: ['0199c6a0-0000-7000-8000-0000000000b1'],
        memberships: [],
        platformRole: 'admin',
      },
    });
    expect(claims.biz).toEqual(['0199c6a0-0000-7000-8000-0000000000b1']);
    expect(claims).not.toHaveProperty('m');
    expect(claims.plt).toBe('admin');
  });
});

describe('isClientAllowed', () => {
  it('lets a person use web and mobile, but not tablet', () => {
    expect(isClientAllowed(user, NO_ACCESS, 'web')).toBe(true);
    expect(isClientAllowed(user, NO_ACCESS, 'mobile')).toBe(true);
    expect(isClientAllowed(user, NO_ACCESS, 'tablet')).toBe(false);
  });

  it('keeps technical accounts on their app and team accounts out', () => {
    const technical = { ...user, accountKind: 'technical' as const };
    expect(isClientAllowed(technical, tabletGrants, 'tablet')).toBe(true);
    expect(isClientAllowed(technical, tabletGrants, 'web')).toBe(false);
    const display: AccessGrants = { ...NO_ACCESS, memberships: [{ s: stable, r: 'display' }] };
    expect(isClientAllowed(technical, display, 'web')).toBe(true);
    expect(isClientAllowed(technical, display, 'mobile')).toBe(false);
    expect(isClientAllowed({ ...user, identityPool: 'team' }, NO_ACCESS, 'web')).toBe(false);
  });
});
