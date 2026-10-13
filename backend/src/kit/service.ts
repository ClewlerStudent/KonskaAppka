import { createHash, randomUUID } from 'node:crypto';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import Fastify, {
  LogController,
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify';
import { CLIENT_HEADER } from '../contracts/common.js';
import type { Principal } from '../lib/auth/claims.js';
import type { AccessTokenVerifier } from '../lib/auth/verify.js';
import { authenticate, loginTokenFromHeader } from './authenticate.js';
import { systemClock, type Clock } from './clock.js';
import type { AppEnv } from './env.js';
import type { Logger } from './logger.js';
import { assertAllowedBrowserOrigin, assertBrowserClientId } from './origin.js';
import { ApiError, registerErrorHandling, sendProblem } from './problem.js';
import { createRateLimiter, type RateCheck } from './rate-limit.js';
import {
  routeKey,
  toFastifyPath,
  type AnyRoute,
  type RateLimitKey,
  type RouteBody,
  type RouteParams,
  type RouteQuery,
  type RouteReply,
} from './route.js';
import { checkResponse, parseInput, ResponseContractError } from './validation.js';

/**
 * Szablon serwisu: instancja Fastify na port zewnętrzny (trasy zewnętrzne i otwarte, CORS,
 * ciasteczka, sondy) i po jednej na każdy port wewnętrzny (trasy `internal`). Trasy rejestruje
 * `route(deskryptor, handler)`: rodzaj trasy, Origin, limity, walidację i token sprawdza kit.
 */

export const DEFAULT_BODY_LIMIT = 64 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const PROBE_PATHS = new Set(['/livez', '/readyz']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ServiceOptions {
  readonly name: string;
  readonly appEnv: AppEnv;
  readonly logger: Logger;
  readonly host: string;
  readonly port: number;
  /** Porty wewnętrzne po nazwie z deskryptora (`internal.port`), np. `{ jwks: 8081 }`. */
  readonly internalPorts?: Readonly<Record<string, number>>;
  readonly allowedOrigins: readonly string[];
  /** Adresy albo podsieci proxy, którym ufamy w X-Forwarded-For (TRUST_PROXY); pusta: bez proxy. */
  readonly trustProxy?: readonly string[];
  readonly clock?: Clock;
  readonly bodyLimit?: number;
  /** Mnożnik limitów żądań (dev i test). */
  readonly rateLimitFactor?: number;
  /** Wymagany, gdy serwis ma trasy zewnętrzne. */
  readonly verifier?: AccessTokenVerifier;
  /** Klucz limitu `login` z pola `login` (np. znormalizowany kontakt); domyślnie małe litery. */
  readonly loginRateKey?: (login: string) => string;
  /** Gotowość zależności dla `/readyz` (np. JWKS). */
  readonly isReady?: () => boolean | Promise<boolean>;
}

export interface RouteContext<R extends AnyRoute> {
  readonly req: FastifyRequest;
  readonly reply: FastifyReply;
  readonly body: RouteBody<R>;
  readonly params: RouteParams<R>;
  readonly query: RouteQuery<R>;
  /** Wynik weryfikacji access tokenu; tylko na trasach zewnętrznych. */
  readonly principal: R['kind'] extends 'external' ? Principal : null;
}

export type RouteHandler<R extends AnyRoute> = (ctx: RouteContext<R>) => Promise<RouteReply<R>>;

export interface ListenAddresses {
  readonly external: string;
  readonly internal: Readonly<Record<string, string>>;
}

export interface Service {
  readonly name: string;
  readonly external: FastifyInstance;
  readonly internal: Readonly<Record<string, FastifyInstance>>;
  readonly routes: readonly AnyRoute[];
  readonly isClosing: () => boolean;
  route<R extends AnyRoute>(route: R, handler: NoInfer<RouteHandler<R>>): void;
  ready(): Promise<void>;
  listen(): Promise<ListenAddresses>;
  close(): Promise<void>;
}

function createInstance(options: ServiceOptions): FastifyInstance {
  const app = Fastify({
    loggerInstance: options.logger,
    logController: new LogController({
      requestIdLogLabel: 'request_id',
      disableRequestLogging: (req) => PROBE_PATHS.has(req.url),
    }),
    genReqId: (req) => {
      const header = req.headers['x-request-id'];
      return typeof header === 'string' && UUID_RE.test(header)
        ? header.toLowerCase()
        : randomUUID();
    },
    requestIdHeader: false,
    bodyLimit: options.bodyLimit ?? DEFAULT_BODY_LIMIT,
    requestTimeout: REQUEST_TIMEOUT_MS,
    routerOptions: { maxParamLength: 100 },
    // Lista proxy, nigdy `true`: lewe wpisy X-Forwarded-For podaje klient.
    trustProxy: options.trustProxy?.length ? [...options.trustProxy] : false,
    forceCloseConnections: 'idle',
  }) as unknown as FastifyInstance;

  // Tylko JSON: text/plain (prosty POST z obcej strony bez preflightu) daje 415.
  // Pusta treść z Content-Type: application/json to brak treści (np. POST /logout).
  app.removeAllContentTypeParsers();
  const parseJson = app.getDefaultJsonParser('error', 'error');
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    const text = typeof body === 'string' ? body : body.toString('utf8');
    if (text === '') {
      done(null, undefined);
      return;
    }
    void parseJson(req, text, done);
  });

  app.addHook('onSend', async (req, reply, payload) => {
    reply.header('x-request-id', req.id);
    reply.header('x-content-type-options', 'nosniff');
    if (!reply.hasHeader('cache-control')) reply.header('cache-control', 'no-store');
    return payload;
  });

  registerErrorHandling(app);
  return app;
}

export async function createService(options: ServiceOptions): Promise<Service> {
  const clock = options.clock ?? systemClock;
  const allowedOrigins = new Set(options.allowedOrigins);
  const factor = options.rateLimitFactor ?? 1;
  const loginRateKey = options.loginRateKey ?? ((login: string) => login.trim().toLowerCase());
  const limiter = createRateLimiter(clock);
  const routes: AnyRoute[] = [];
  let closing = false;

  const external = createInstance(options);
  await external.register(cors, {
    origin: (origin, callback) =>
      callback(null, origin !== undefined && allowedOrigins.has(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['content-type', 'authorization', CLIENT_HEADER, 'x-request-id'],
    exposedHeaders: ['retry-after', 'x-request-id'],
    maxAge: 600,
  });
  await external.register(cookie);

  external.get('/livez', () => ({ status: 'ok' }));
  external.get('/readyz', async (_req, reply) => {
    const ready = !closing && (options.isReady ? await options.isReady() : true);
    return ready ? { status: 'ok' } : sendProblem(reply, 'not_ready');
  });

  const internal: Record<string, FastifyInstance> = {};
  for (const name of Object.keys(options.internalPorts ?? {})) {
    internal[name] = createInstance(options);
  }
  const instances = () => [external, ...Object.values(internal)];

  function rateLimit(
    route: AnyRoute,
    req: FastifyRequest,
    keys: readonly RateLimitKey[],
    body: unknown,
  ): void {
    if (!route.open) return;
    const checks: RateCheck[] = [];
    for (const rule of route.open.rateLimit) {
      if (!keys.includes(rule.by)) continue;
      const value = rateKeyValue(rule.by, req, body);
      if (value === undefined) continue;
      checks.push({
        key: `${routeKey(route)}|${rule.by}|${value}`,
        max: rule.max * factor,
        windowSec: rule.windowSec,
      });
    }
    if (checks.length === 0) return;
    const result = limiter.hit(checks);
    if (!result.ok) {
      throw new ApiError('rate_limited', {
        headers: { 'retry-after': String(result.retryAfterSec) },
      });
    }
  }

  function rateKeyValue(by: RateLimitKey, req: FastifyRequest, body: unknown): string | undefined {
    switch (by) {
      case 'ip':
        return req.ip;
      case 'login': {
        const login =
          typeof body === 'object' && body !== null && 'login' in body ? body.login : undefined;
        return typeof login === 'string' ? loginRateKey(login) : undefined;
      }
      case 'loginToken': {
        // Nagłówek w innej postaci trasa odrzuca, zanim zapyta dostawcę tożsamości.
        const token = loginTokenFromHeader(req);
        return token === null ? undefined : createHash('sha256').update(token).digest('base64url');
      }
    }
  }

  async function prepare<R extends AnyRoute>(
    route: R,
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<RouteContext<R>> {
    let principal: Principal | null = null;
    if (route.kind === 'external') {
      if (!options.verifier) throw new Error(`${route.operationId}: service has no verifier`);
      principal = await authenticate(req, options.verifier);
    }
    if (route.kind === 'open') {
      assertAllowedBrowserOrigin(req, allowedOrigins);
      rateLimit(route, req, ['ip'], undefined);
    }
    const params = route.params ? parseInput(route.params, req.params, 'params') : undefined;
    const query = route.query ? parseInput(route.query, req.query, 'query') : undefined;
    const body = route.body ? parseInput(route.body, req.body, 'body') : undefined;
    if (route.kind === 'open') {
      assertBrowserClientId(req, body);
      rateLimit(route, req, ['login', 'loginToken'], body);
    }
    return { req, reply, body, params, query, principal } as RouteContext<R>;
  }

  return {
    name: options.name,
    external,
    internal,
    routes,
    isClosing: () => closing,

    route(route, handler) {
      let target = external;
      if (route.kind === 'internal' && route.internal) {
        const instance = internal[route.internal.port];
        if (!instance) {
          throw new Error(`${route.operationId}: no internal port named ${route.internal.port}`);
        }
        target = instance;
      }
      if (route.kind === 'external' && !options.verifier) {
        throw new Error(`${route.operationId}: external routes need a token verifier`);
      }
      target.route({
        method: route.method,
        url: toFastifyPath(route.path),
        handler: async (req, reply) => {
          const ctx = await prepare(route, req, reply);
          const { status, body } = await handler(ctx);
          const checked = checkResponse(route, status, body);
          if (checked.extraFields.length > 0) {
            // Pola spoza kontraktu nie wychodzą nigdzie; poza prod to błąd, żeby testy go pokazały.
            const fields = checked.extraFields.join(', ');
            if (options.appEnv !== 'prod') {
              throw new ResponseContractError(
                route,
                status,
                `fields outside the contract: ${fields}`,
              );
            }
            req.log.error(
              { operationId: route.operationId, extraFields: checked.extraFields },
              'response fields outside the contract were stripped',
            );
          }
          const out = checked.body;
          reply.code(status);
          return out === undefined ? reply.send() : reply.send(out);
        },
      });
      routes.push(route);
    },

    async ready() {
      await Promise.all(instances().map((app) => app.ready()));
    },

    async listen() {
      const externalAddress = await external.listen({ host: options.host, port: options.port });
      const internalAddresses: Record<string, string> = {};
      for (const [name, app] of Object.entries(internal)) {
        const port = options.internalPorts?.[name] ?? 0;
        internalAddresses[name] = await app.listen({ host: options.host, port });
      }
      return { external: externalAddress, internal: internalAddresses };
    },

    async close() {
      closing = true;
      await Promise.all(instances().map((app) => app.close()));
    },
  };
}

/** SIGTERM i SIGINT: `/readyz` daje 503, potem drenaż HTTP i wyjście; po czasie wyjście wymuszone. */
export function installShutdown(service: Service, logger: Logger, timeoutMs = 10_000): void {
  let started = false;
  const shutdown = (signal: NodeJS.Signals) => {
    if (started) return;
    started = true;
    logger.info({ signal }, 'shutting down');
    setTimeout(() => {
      logger.error('shutdown timed out');
      process.exit(1);
    }, timeoutMs).unref();
    service.close().then(
      () => {
        logger.info('closed');
        process.exit(0);
      },
      (error: unknown) => {
        logger.error({ err: error }, 'shutdown failed');
        process.exit(1);
      },
    );
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
