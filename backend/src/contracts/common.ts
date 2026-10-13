import { z } from 'zod';

/**
 * Kody błędów API (pole `code` w application/problem+json) z ich statusem HTTP.
 * Lista rośnie addytywnie; klienci mapują nieznany kod na ogólny komunikat.
 */
export const ERRORS = {
  validation_failed: { status: 400, title: 'Request validation failed' },
  invalid_credentials: { status: 401, title: 'Invalid credentials' },
  invalid_code: { status: 401, title: 'Invalid code' },
  invalid_token: { status: 401, title: 'Invalid token' },
  token_expired: { status: 401, title: 'Token expired' },
  session_revoked: { status: 401, title: 'Session revoked' },
  origin_not_allowed: { status: 403, title: 'Origin not allowed' },
  client_not_allowed: { status: 403, title: 'Client not allowed' },
  wrong_client: { status: 403, title: 'Account cannot use this client' },
  account_locked: { status: 403, title: 'Account locked' },
  not_found: { status: 404, title: 'Not found' },
  account_not_confirmed: { status: 409, title: 'Account not confirmed' },
  payload_too_large: { status: 413, title: 'Payload too large' },
  unsupported_media_type: { status: 415, title: 'Unsupported media type' },
  weak_password: { status: 422, title: 'Password too weak' },
  rate_limited: { status: 429, title: 'Too many requests' },
  internal_error: { status: 500, title: 'Internal error' },
  not_ready: { status: 503, title: 'Service not ready' },
} as const satisfies Record<string, { status: number; title: string }>;

export type ErrorCode = keyof typeof ERRORS;

export const ERROR_CODES = Object.keys(ERRORS) as [ErrorCode, ...ErrorCode[]];

export const PROBLEM_TYPE_PREFIX = 'urn:equenor:problem:';

export const ErrorCodeSchema = z.enum(ERROR_CODES);

export const ProblemSchema = z.object({
  type: z.string().describe('urn:equenor:problem:<code>'),
  title: z.string(),
  status: z.number().int(),
  code: ErrorCodeSchema,
  detail: z.string().optional(),
  errors: z
    .array(z.object({ path: z.string(), message: z.string() }))
    .optional()
    .describe('Błędy walidacji, bez wartości z żądania'),
});
export type Problem = z.infer<typeof ProblemSchema>;

/** Aplikacje, które logują się trasami /auth/v1 (ops i opctl później, na hoście [OPS]). */
export const ClientIdSchema = z.enum(['web', 'mobile', 'tablet']);
export type ClientId = z.infer<typeof ClientIdSchema>;

export const LocaleSchema = z.enum(['pl', 'uk', 'en']);
export type Locale = z.infer<typeof LocaleSchema>;

export const CodeChannelSchema = z.enum(['sms', 'email']);
export type CodeChannel = z.infer<typeof CodeChannelSchema>;

/** E-mail (z `@`) albo telefon; normalizuje i sprawdza format serwis auth (400 validation_failed). */
export const LoginSchema = z
  .string()
  .min(3)
  .max(254)
  .describe('E-mail albo numer telefonu (9 cyfr albo E.164)');

export const Code6Schema = z.string().regex(/^\d{6}$/);
export const Code8Schema = z.string().regex(/^\d{8}$/);

/** Schematy wspólne, zawsze w components.schemas każdego serwisu. */
export const commonSchemas = {
  Problem: ProblemSchema,
  ErrorCode: ErrorCodeSchema,
  ClientId: ClientIdSchema,
  Locale: LocaleSchema,
  CodeChannel: CodeChannelSchema,
} as const;

/**
 * Nagłówek wymagany od przeglądarki na trasach otwartych (wymusza preflight CORS)
 * i przy odświeżaniu tokenu z ciasteczka. Wartość: `web`.
 */
export const CLIENT_HEADER = 'x-equenor-client';
