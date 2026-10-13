import { describe, expect, it } from 'vitest';
import { AccessClaims, LoginClaims, RefreshClaims, toPrincipal } from './claims.js';

const ids = {
  user: '0199c6a0-0000-7000-8000-000000000001',
  session: '0199c6a0-0000-7000-8000-0000000000a1',
  business: '0199c6a0-0000-7000-8000-0000000000b1',
  stable: '0199c6a0-0000-7000-8000-0000000000c1',
  horse: '0199c6a0-0000-7000-8000-0000000000d1',
};

const access = {
  iss: 'http://localhost:4010/auth/v1',
  aud: 'equenor-api',
  sub: ids.user,
  sid: ids.session,
  client_id: 'web',
  iat: 1791868500,
  exp: 1791868800,
  jti: '0199c6a0-0000-7000-8000-0000000000e1',
  ver: 1,
  amr: ['pwd', 'otp'],
  auth_time: 1791867900,
};

describe('AccessClaims', () => {
  it('maps a minimal token to a principal', () => {
    const principal = toPrincipal(AccessClaims.parse(access));
    expect(principal).toEqual({
      userId: ids.user,
      sessionId: ids.session,
      clientId: 'web',
      tokenId: access.jti,
      authTime: access.auth_time,
      expiresAt: access.exp,
      amr: ['pwd', 'otp'],
      businesses: [],
      memberships: [],
      platformRole: null,
    });
  });

  it('accepts optional biz, m and plt and ignores unknown claims', () => {
    const claims = AccessClaims.parse({
      ...access,
      biz: [ids.business],
      m: [{ s: ids.stable, r: 'client', f: ['flags', 'rides'], h: [ids.horse] }],
      plt: 'admin',
      extra: 'ignored',
    });
    expect(claims).not.toHaveProperty('extra');
    const principal = toPrincipal(claims);
    expect(principal.businesses).toEqual([ids.business]);
    expect(principal.memberships[0]?.r).toBe('client');
    expect(principal.platformRole).toBe('admin');
  });

  it.each([
    ['ver 2', { ver: 2 }],
    ['unknown client', { client_id: 'desktop' }],
    ['unknown role', { m: [{ s: ids.stable, r: 'owner' }] }],
    ['non-uuid sub', { sub: 'u-damian' }],
  ])('rejects %s', (_name, patch) => {
    expect(AccessClaims.safeParse({ ...access, ...patch }).success).toBe(false);
  });
});

describe('RefreshClaims and LoginClaims', () => {
  it('parse their shapes', () => {
    expect(
      RefreshClaims.safeParse({
        iss: access.iss,
        aud: 'equenor-auth',
        sub: ids.user,
        client_id: 'web',
        sid: ids.session,
        sst: access.auth_time,
        tv: 0,
        iat: access.iat,
        exp: access.iat + 7 * 86400,
        jti: 'r1',
      }).success,
    ).toBe(true);
    expect(
      LoginClaims.safeParse({
        iss: access.iss,
        aud: 'equenor-auth',
        client_id: 'web',
        idp_uid: 'idp-1',
        idp_sid: 'idp-session-1',
        purpose: 'login',
        ch: 'sms',
        iat: access.iat,
        exp: access.iat + 300,
        jti: 'l1',
      }).success,
    ).toBe(true);
  });
});
