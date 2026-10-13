import { z } from 'zod';
import type { ErrorCode } from '../contracts/common.js';

/**
 * Deskryptor trasy: jedno źródło dla serwera (walidacja, rodzaj trasy, limity)
 * i dla OpenAPI. Domyślnie trasa jest zewnętrzna, czyli wymaga access tokenu.
 */

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

export type RouteKind = 'external' | 'open' | 'internal';

/** Klucz limitu: adres IP, znormalizowany login z treści albo skrót tokenu logowania. */
export type RateLimitKey = 'ip' | 'login' | 'loginToken';

export interface RateRule {
  readonly by: RateLimitKey;
  readonly max: number;
  readonly windowSec: number;
}

/** Poświadczenie trasy otwartej innego rodzaju niż access token. */
export type OpenCredential = 'loginToken' | 'refreshToken';

export interface OpenPolicy {
  /** Dlaczego trasa jest bez access tokenu (do przeglądu listy open-routes.txt). */
  readonly reason: string;
  readonly rateLimit: readonly RateRule[];
  readonly credential?: OpenCredential;
}

export interface InternalPolicy {
  /** Nazwa portu wewnętrznego, np. `jwks`; numer portu daje konfiguracja serwisu. */
  readonly port: string;
  /** Serwisy, które wołają trasę (`*` = wszystkie serwisy z API). */
  readonly callers: readonly string[];
}

export interface ResponseSpec {
  readonly description: string;
  /** Treść `application/json`; brak oznacza odpowiedź bez treści. */
  readonly schema?: z.ZodType;
  /** Nagłówki odpowiedzi: nazwa → opis. */
  readonly headers?: Readonly<Record<string, string>>;
}

interface RouteCommon {
  readonly operationId: string;
  readonly method: HttpMethod;
  /** Pełna ścieżka z prefiksem `/<serwis>/v1`, parametry w stylu OpenAPI: `{stableId}`. */
  readonly path: string;
  readonly summary: string;
  readonly params?: z.ZodObject;
  readonly query?: z.ZodObject;
  readonly body?: z.ZodType;
  /** Odpowiedzi poprawne (2xx/3xx). Błędy opisuje `errors`. */
  readonly responses: Readonly<Record<number, ResponseSpec>>;
  /** Kody błędów właściwe trasie (problem+json); błędy ogólne kit opisuje odpowiedź `default`. */
  readonly errors: readonly ErrorCode[];
}

export interface ExternalRouteInput extends RouteCommon {
  readonly kind?: 'external';
  readonly open?: never;
  readonly internal?: never;
}

export interface OpenRouteInput extends RouteCommon {
  readonly kind: 'open';
  readonly open: OpenPolicy;
  readonly internal?: never;
}

export interface InternalRouteInput extends RouteCommon {
  readonly kind: 'internal';
  readonly internal: InternalPolicy;
  readonly open?: never;
}

export type RouteInput = ExternalRouteInput | OpenRouteInput | InternalRouteInput;

type KindOf<T> = T extends { readonly kind: infer K extends RouteKind } ? K : 'external';

export type Route<T extends RouteInput = RouteInput> = T & { readonly kind: KindOf<T> };

export type AnyRoute = Route;

const PATH_RE = /^\/[a-z][a-z0-9-]*\/v1(\/[A-Za-z0-9._~{}-]+)+$/;
const OPERATION_ID_RE = /^[a-z][A-Za-z0-9]*$/;
const INTERNAL_PATH_RE = /\/(internal|\.well-known)\//;

function fail(def: { method?: string; path?: string }, message: string): never {
  throw new Error(`Route ${def.method ?? '?'} ${def.path ?? '?'}: ${message}`);
}

function isPositiveInt(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/** Sprawdza niezmienniki deskryptora i zwraca go zamrożonego, z jawnym `kind`. */
export function defineRoute<const T extends RouteInput>(def: T): Route<T> {
  const kind: RouteKind = def.kind ?? 'external';
  // Deskryptory mogą przyjść z kodu bez typów; niezmienniki sprawdzamy w czasie wykonania.
  const raw: { open?: OpenPolicy; internal?: InternalPolicy } = def;

  if (!HTTP_METHODS.includes(def.method)) fail(def, `unknown method ${String(def.method)}`);
  if (!PATH_RE.test(def.path)) fail(def, 'path must look like /<service>/v1/...');
  if (!OPERATION_ID_RE.test(def.operationId)) fail(def, 'operationId must be camelCase');
  if (def.method === 'GET' && def.body) fail(def, 'GET route cannot have a body');

  const statuses = Object.keys(def.responses).map(Number);
  if (!statuses.some((s) => s >= 200 && s < 300)) fail(def, 'needs a 2xx response');
  if (statuses.some((s) => !Number.isInteger(s) || s < 200 || s >= 400)) {
    fail(def, 'responses lists only 2xx/3xx statuses; errors go to `errors`');
  }
  if (new Set(def.errors).size !== def.errors.length) fail(def, 'duplicate error codes');

  const pathParams = [...def.path.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
  const paramKeys = def.params ? Object.keys(def.params.shape) : [];
  if (pathParams.join() !== paramKeys.join()) {
    fail(def, 'params schema must list path parameters in order');
  }

  const looksInternal = INTERNAL_PATH_RE.test(def.path);

  if (kind === 'open') {
    const open = raw.open;
    if (!open || typeof open.reason !== 'string' || open.reason.trim() === '') {
      fail(def, 'open route needs open.reason');
    }
    const rules: readonly RateRule[] = open.rateLimit;
    if (!rules || rules.length === 0) {
      fail(def, 'open route needs open.rateLimit');
    }
    for (const rule of rules) {
      if (!isPositiveInt(rule.max) || !isPositiveInt(rule.windowSec)) {
        fail(def, 'rate rule needs positive integer max and windowSec');
      }
      if (rule.by === 'loginToken' && open.credential !== 'loginToken') {
        fail(def, 'rate key loginToken needs open.credential = loginToken');
      }
      if (rule.by === 'login' && !(def.body instanceof z.ZodObject && 'login' in def.body.shape)) {
        fail(def, 'rate key login needs a body with a login field');
      }
    }
  } else if (raw.open !== undefined) {
    fail(def, 'only open routes may have `open`');
  }

  if (kind === 'internal') {
    const internal = raw.internal;
    if (!internal || typeof internal.port !== 'string' || internal.port === '') {
      fail(def, 'internal route needs internal.port');
    }
    const callers: readonly string[] = internal.callers;
    if (!callers || callers.length === 0) {
      fail(def, 'internal route needs internal.callers');
    }
    if (!looksInternal) fail(def, 'internal route path must contain /internal/ or /.well-known/');
  } else {
    if (raw.internal !== undefined) fail(def, 'only internal routes may have `internal`');
    if (looksInternal) fail(def, '/internal/ and /.well-known/ paths must be internal routes');
  }

  const route = { ...def, kind } as Route<T>;
  return Object.freeze(route);
}

/** `GET /auth/v1/me` */
export function routeKey(route: Pick<RouteInput, 'method' | 'path'>): string {
  return `${route.method} ${route.path}`;
}

/** `/stables/v1/stables/{stableId}` → `/stables/v1/stables/:stableId` */
export function toFastifyPath(path: string): string {
  return path.replace(/\{(\w+)\}/g, ':$1');
}

type OutputOf<S> = S extends z.ZodType ? z.output<S> : undefined;

export type RouteBody<R extends RouteInput> = OutputOf<R['body']>;
export type RouteParams<R extends RouteInput> = OutputOf<R['params']>;
export type RouteQuery<R extends RouteInput> = OutputOf<R['query']>;

type Responses<R extends RouteInput> = R['responses'];

/** Statusy poprawnych odpowiedzi trasy. */
export type RouteStatus<R extends RouteInput> = keyof Responses<R> & number;

/** Treść odpowiedzi dla statusu (wejście schematu, bo serwer ją dopiero serializuje). */
export type RouteResponseBody<
  R extends RouteInput,
  S extends RouteStatus<R>,
> = Responses<R>[S] extends { readonly schema: infer Schema extends z.ZodType }
  ? z.input<Schema>
  : undefined;

/** Unia `{ status, body }` wszystkich poprawnych odpowiedzi trasy. */
export type RouteReply<R extends RouteInput> = {
  [S in RouteStatus<R>]: { status: S; body: RouteResponseBody<R, S> };
}[RouteStatus<R>];
