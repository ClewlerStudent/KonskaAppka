import { z } from 'zod';
import { CLAIMS_VERSION } from './constants.js';

/**
 * Claimy tokenów EQUENOR (docs/mikroserwisy.md 3.2). Wylicza i podpisuje je tylko auth,
 * pozostałe serwisy tylko je czytają. Nadmiarowe claimy są ignorowane (z.object usuwa je).
 * Enumy są ścisłe: wszystkie serwisy jadą z jednego obrazu, więc znają te same wartości.
 */

export const ClientId = z.enum(['mobile', 'web', 'tablet', 'ops', 'opctl']);
export type ClientId = z.infer<typeof ClientId>;

export const Feature = z.enum([
  'flags',
  'feeding_plan',
  'routine',
  'box_history',
  'tasks',
  'health',
  'rides',
]);
export type Feature = z.infer<typeof Feature>;

export const StableRole = z.enum(['staff', 'instructor', 'client', 'display', 'tablet']);
export type StableRole = z.infer<typeof StableRole>;

export const PlatformRole = z.enum(['admin', 'support']);
export type PlatformRole = z.infer<typeof PlatformRole>;

export const CodeChannel = z.enum(['sms', 'email']);
export type CodeChannel = z.infer<typeof CodeChannel>;

/** Członkostwo w stajni: `s` stajnia, `r` rola, `f` widoczne funkcje, `h` konie klienta. */
export const Membership = z.object({
  s: z.uuid(),
  r: StableRole,
  f: z.array(Feature).optional(),
  h: z.array(z.uuid()).optional(),
});
export type Membership = z.infer<typeof Membership>;

const NumericDate = z.number().int().nonnegative();
const Audience = z.union([z.string(), z.array(z.string())]);

export const AccessClaims = z.object({
  iss: z.string(),
  aud: Audience,
  sub: z.uuid(),
  sid: z.uuid(),
  client_id: ClientId,
  iat: NumericDate,
  exp: NumericDate,
  jti: z.string().min(1),
  ver: z.literal(CLAIMS_VERSION),
  amr: z.array(z.string()),
  auth_time: NumericDate,
  biz: z.array(z.uuid()).optional(),
  m: z.array(Membership).optional(),
  plt: PlatformRole.optional(),
});
export type AccessClaims = z.infer<typeof AccessClaims>;

export const RefreshClaims = z.object({
  iss: z.string(),
  aud: Audience,
  sub: z.uuid(),
  client_id: ClientId,
  sid: z.uuid(),
  /** Start sesji (czas kroku MFA); z niego `auth_time` access tokenu. */
  sst: NumericDate,
  /** `users.token_version` w chwili wydania. */
  tv: z.number().int().nonnegative(),
  iat: NumericDate,
  exp: NumericDate,
  jti: z.string().min(1),
});
export type RefreshClaims = z.infer<typeof RefreshClaims>;

export const LoginPurpose = z.enum(['login']);

export const LoginClaims = z.object({
  iss: z.string(),
  aud: Audience,
  client_id: ClientId,
  idp_uid: z.string().min(1),
  idp_sid: z.string().min(1),
  purpose: LoginPurpose,
  ch: CodeChannel,
  iat: NumericDate,
  exp: NumericDate,
  jti: z.string().min(1),
});
export type LoginClaims = z.infer<typeof LoginClaims>;

/** Kto woła: wynik weryfikacji access tokenu, w nazwach kodu zamiast skrótów claimów. */
export interface Principal {
  readonly userId: string;
  readonly sessionId: string;
  readonly clientId: ClientId;
  readonly tokenId: string;
  /** Sekundy od epoki. */
  readonly authTime: number;
  readonly expiresAt: number;
  readonly amr: readonly string[];
  readonly businesses: readonly string[];
  readonly memberships: readonly Membership[];
  readonly platformRole: PlatformRole | null;
}

export function toPrincipal(claims: AccessClaims): Principal {
  return {
    userId: claims.sub,
    sessionId: claims.sid,
    clientId: claims.client_id,
    tokenId: claims.jti,
    authTime: claims.auth_time,
    expiresAt: claims.exp,
    amr: claims.amr,
    businesses: claims.biz ?? [],
    memberships: claims.m ?? [],
    platformRole: claims.plt ?? null,
  };
}
