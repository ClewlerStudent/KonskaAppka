/** Odbiorca access tokenu: wszystkie serwisy z API. */
export const ACCESS_AUD = 'equenor-api';
/** Odbiorca refresh tokenu i tokenu logowania: tylko serwis auth. */
export const AUTH_AUD = 'equenor-auth';

export const TYP_ACCESS = 'at+jwt';
export const TYP_REFRESH = 'rt+jwt';
export const TYP_LOGIN = 'login+jwt';

export const SIGNING_ALG = 'ES256';

/** Wersja schematu claimów access tokenu (`ver`). */
export const CLAIMS_VERSION = 1;

export const ACCESS_TTL_S = 300;
export const LOGIN_TTL_S = 300;
/** Tolerancja zegara dla `iat` z przyszłości. */
export const IAT_SKEW_S = 60;

/** Cache JWKS w serwisach i najkrótszy odstęp między pobraniami. */
export const JWKS_CACHE_MAX_AGE_MS = 5 * 60_000;
export const JWKS_COOLDOWN_MS = 30_000;
