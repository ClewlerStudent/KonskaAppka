import { createLocalJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { v7 as uuidv7 } from 'uuid';
import type { z } from 'zod';
import type { ClientId, CodeChannel } from '../../../contracts/common.js';
import { epochSeconds, type Clock } from '../../../kit/clock.js';
import { LoginClaims, RefreshClaims } from '../../../lib/auth/claims.js';
import {
  ACCESS_TTL_S,
  AUTH_AUD,
  LOGIN_TTL_S,
  SIGNING_ALG,
  TYP_ACCESS,
  TYP_LOGIN,
  TYP_REFRESH,
} from '../../../lib/auth/constants.js';
import { createAccessTokenVerifier, type AccessTokenVerifier } from '../../../lib/auth/verify.js';
import type { AccessGrants } from '../access/access-repository.js';
import type { User } from '../users/user-repository.js';
import { computeAccessClaims, sessionKindOf } from './claims.js';
import { refreshExpiry, sessionWindow } from './lifetimes.js';
import type { Signer } from './signer.js';

/**
 * Tokeny EQUENOR podpisuje tylko auth, jednym kluczem (docs/mikroserwisy.md 3.2):
 * access (at+jwt, 5 min), refresh (rt+jwt, bez zapisu w bazie) i token logowania
 * (login+jwt, 5 min, z id sesji dostawcy tożsamości i celem `login`).
 */

export interface LoginTokenInput {
  readonly clientId: ClientId;
  readonly idpUserId: string;
  readonly idpSessionId: string;
  readonly channel: CodeChannel;
}

export interface SessionInput {
  readonly user: User;
  readonly clientId: ClientId;
  readonly grants: AccessGrants;
  /** Id logowania (UUIDv7), przenoszony przy odświeżaniu. */
  readonly sid: string;
  /** Start sesji w sekundach; z niego `auth_time` i maksimum okna. */
  readonly sst: number;
}

export interface IssuedSession {
  readonly accessToken: string;
  readonly expiresIn: number;
  readonly refreshToken: string;
  /** `exp` refresh tokenu (sekundy od epoki), np. do Max-Age ciasteczka. */
  readonly refreshExp: number;
}

export interface TokenService {
  issueLoginToken(input: LoginTokenInput): Promise<{ token: string; expiresIn: number }>;
  /** Claimy tokenu logowania albo null (zły podpis, typ, aud, cel, wygasły). */
  verifyLoginToken(token: string): Promise<LoginClaims | null>;
  /** Para tokenów albo null, gdy sesja przekroczyła maksymalny czas. */
  issueSession(input: SessionInput): Promise<IssuedSession | null>;
  /** Claimy refresh tokenu albo null (zły podpis, nieznany kid, typ, aud, wygasły). */
  verifyRefreshToken(token: string): Promise<RefreshClaims | null>;
  /** Weryfikator access tokenów z kluczami w procesie (trasy zewnętrzne auth). */
  readonly accessVerifier: AccessTokenVerifier;
}

export function createTokenService(options: {
  signer: Signer;
  issuer: string;
  clock: Clock;
}): TokenService {
  const { signer, issuer, clock } = options;
  const keys: JWTVerifyGetKey = createLocalJWKSet(signer.publicJwks());

  async function verifyOwn<S extends z.ZodType>(
    token: string,
    typ: string,
    schema: S,
    maxLifetime?: number,
  ): Promise<z.output<S> | null> {
    try {
      const { payload } = await jwtVerify(token, keys, {
        algorithms: [SIGNING_ALG],
        typ,
        issuer,
        audience: AUTH_AUD,
        currentDate: clock.now(),
        requiredClaims: ['iat', 'exp', 'jti'],
      });
      if (maxLifetime !== undefined && (payload.exp ?? 0) - (payload.iat ?? 0) > maxLifetime) {
        return null;
      }
      const parsed = schema.safeParse(payload);
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  return {
    accessVerifier: createAccessTokenVerifier({
      issuer,
      clock,
      keys: { jwks: signer.publicJwks() },
    }),

    async issueLoginToken(input) {
      const iat = epochSeconds(clock);
      const claims: LoginClaims = {
        iss: issuer,
        aud: AUTH_AUD,
        client_id: input.clientId,
        idp_uid: input.idpUserId,
        idp_sid: input.idpSessionId,
        purpose: 'login',
        ch: input.channel,
        iat,
        exp: iat + LOGIN_TTL_S,
        jti: uuidv7(),
      };
      return { token: await signer.sign(TYP_LOGIN, claims), expiresIn: LOGIN_TTL_S };
    },

    verifyLoginToken: (token) => verifyOwn(token, TYP_LOGIN, LoginClaims, LOGIN_TTL_S),

    async issueSession(input) {
      const now = epochSeconds(clock);
      const window = sessionWindow(input.clientId, sessionKindOf(input.user, input.grants));
      const refreshExp = refreshExpiry(now, input.sst, window);
      if (refreshExp === null) return null;

      const access = computeAccessClaims({
        issuer,
        userId: input.user.id,
        clientId: input.clientId,
        sid: input.sid,
        authTime: input.sst,
        iat: now,
        jti: uuidv7(),
        grants: input.grants,
      });
      const refresh: RefreshClaims = {
        iss: issuer,
        aud: AUTH_AUD,
        sub: input.user.id,
        client_id: input.clientId,
        sid: input.sid,
        sst: input.sst,
        tv: input.user.tokenVersion,
        iat: now,
        exp: refreshExp,
        jti: uuidv7(),
      };
      const [accessToken, refreshToken] = await Promise.all([
        signer.sign(TYP_ACCESS, access),
        signer.sign(TYP_REFRESH, refresh),
      ]);
      return { accessToken, expiresIn: ACCESS_TTL_S, refreshToken, refreshExp };
    },

    verifyRefreshToken: (token) => verifyOwn(token, TYP_REFRESH, RefreshClaims),
  };
}
