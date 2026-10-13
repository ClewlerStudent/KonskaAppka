import {
  createLocalJWKSet,
  createRemoteJWKSet,
  errors,
  jwtVerify,
  type JSONWebKeySet,
  type JWTVerifyGetKey,
} from 'jose';
import { systemClock, type Clock } from '../../kit/clock.js';
import { AccessClaims, toPrincipal, type Principal } from './claims.js';
import {
  ACCESS_AUD,
  ACCESS_TTL_S,
  IAT_SKEW_S,
  JWKS_CACHE_MAX_AGE_MS,
  JWKS_COOLDOWN_MS,
  SIGNING_ALG,
  TYP_ACCESS,
} from './constants.js';

/**
 * Weryfikacja access tokenu EQUENOR w każdym serwisie, lokalnie (docs/mikroserwisy.md 3.5):
 * tylko ES256, typ at+jwt, iss środowiska, aud equenor-api, exp, iat nie z przyszłości
 * i czas życia najwyżej 5 min. Refresh token i token logowania odpadają na typ i aud.
 */

export type TokenErrorCode = 'invalid_token' | 'token_expired';

export class TokenError extends Error {
  constructor(
    readonly code: TokenErrorCode,
    reason: string,
  ) {
    super(reason);
    this.name = 'TokenError';
  }
}

export type KeySource =
  /** JWKS z auth (port jwks); cache 5 min, ponowne pobranie nie częściej niż co 30 s. */
  | {
      readonly jwksUrl: string | URL;
      readonly cacheMaxAgeMs?: number;
      readonly cooldownMs?: number;
      readonly timeoutMs?: number;
    }
  /** Klucze w procesie (sam auth weryfikuje swoje tokeny bez sieci). */
  | { readonly jwks: JSONWebKeySet };

export interface AccessTokenVerifierOptions {
  readonly issuer: string;
  readonly keys: KeySource;
  readonly clock?: Clock;
}

export interface AccessTokenVerifier {
  /** Principal albo TokenError (`token_expired` tylko przy poprawnym podpisie). */
  verify(token: string): Promise<Principal>;
  /** Czy klucze są dostępne (`/readyz` serwisu czeka tylko na JWKS). */
  isReady(): Promise<boolean>;
}

export function createAccessTokenVerifier(
  options: AccessTokenVerifierOptions,
): AccessTokenVerifier {
  const clock = options.clock ?? systemClock;
  let getKey: JWTVerifyGetKey;
  let isReady: () => Promise<boolean>;

  if ('jwks' in options.keys) {
    getKey = createLocalJWKSet(options.keys.jwks);
    isReady = () => Promise.resolve(true);
  } else {
    const remote = createRemoteJWKSet(new URL(options.keys.jwksUrl), {
      cacheMaxAge: options.keys.cacheMaxAgeMs ?? JWKS_CACHE_MAX_AGE_MS,
      cooldownDuration: options.keys.cooldownMs ?? JWKS_COOLDOWN_MS,
      timeoutDuration: options.keys.timeoutMs ?? 5000,
    });
    getKey = remote;
    isReady = async () => {
      if (remote.jwks()) return true;
      try {
        await remote.reload();
        return true;
      } catch {
        return false;
      }
    };
  }

  return {
    isReady,
    async verify(token) {
      const now = clock.now();
      let payload: unknown;
      try {
        ({ payload } = await jwtVerify(token, getKey, {
          algorithms: [SIGNING_ALG],
          typ: TYP_ACCESS,
          issuer: options.issuer,
          audience: ACCESS_AUD,
          currentDate: now,
          requiredClaims: ['sub', 'iat', 'exp', 'jti'],
        }));
      } catch (error) {
        if (error instanceof errors.JWTExpired) throw new TokenError('token_expired', 'expired');
        throw new TokenError('invalid_token', error instanceof Error ? error.name : 'invalid');
      }

      const parsed = AccessClaims.safeParse(payload);
      if (!parsed.success) throw new TokenError('invalid_token', 'claims');
      const claims = parsed.data;
      const nowSec = Math.floor(now.getTime() / 1000);
      if (claims.iat > nowSec + IAT_SKEW_S) throw new TokenError('invalid_token', 'iat in future');
      if (claims.exp - claims.iat > ACCESS_TTL_S) {
        throw new TokenError('invalid_token', 'lifetime too long');
      }
      return toPrincipal(claims);
    },
  };
}
