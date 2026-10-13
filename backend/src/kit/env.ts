import { isIP } from 'node:net';
import { z } from 'zod';

/**
 * Konfiguracja serwisu z env, walidowana zod. Przy błędzie serwis nie startuje, a komunikat
 * wymienia tylko nazwy zmiennych (bez wartości, bo env niesie sekrety).
 */

export const AppEnvSchema = z.enum(['dev', 'test', 'prod']);
export type AppEnv = z.infer<typeof AppEnvSchema>;

export const envBoolean = z
  .enum(['true', 'false', '1', '0'])
  .transform((value) => value === 'true' || value === '1');

export const envPort = z.coerce.number().int().min(0).max(65535);

const PROXY_NAMES = new Set(['loopback', 'linklocal', 'uniquelocal']);

function isProxyEntry(entry: string): boolean {
  if (PROXY_NAMES.has(entry)) return true;
  const [address = '', prefix, ...rest] = entry.split('/');
  const version = isIP(address);
  if (version === 0 || rest.length > 0) return false;
  if (prefix === undefined) return true;
  return /^\d{1,3}$/.test(prefix) && Number(prefix) <= (version === 4 ? 32 : 128);
}

/**
 * Proxy przed serwisem, którym ufamy w X-Forwarded-For: adresy, CIDR albo `loopback`,
 * `linklocal`, `uniquelocal`, po przecinku (np. podsieć ALB). Adres klienta to pierwszy od
 * prawej wpis spoza listy. `true` (ufaj wszystkim wpisom) jest odrzucane, bo lewe wpisy podaje
 * klient; liczby przeskoków Fastify nie obsługuje (nie ufa wtedy nikomu). `false`: bez proxy.
 */
export const envTrustProxy = z
  .string()
  .transform((value) =>
    value === 'false'
      ? []
      : value
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item !== ''),
  )
  .pipe(
    z.array(
      z
        .string()
        .refine(
          isProxyEntry,
          'expected an IP address, a CIDR or loopback/linklocal/uniquelocal; true is not allowed',
        ),
    ),
  );

const originSchema = z.string().refine((value) => {
  try {
    return new URL(value).origin === value;
  } catch {
    return false;
  }
}, 'expected an origin like https://panel.example.com (scheme, host, optional port)');

/** Lista originów po przecinku. */
export const envOrigins = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== ''),
  )
  .pipe(z.array(originSchema));

export const baseEnvSchema = z.object({
  APP_ENV: AppEnvSchema,
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  /** Czytelne logi w terminalu (pino-pretty, zależność dev); w prod zabronione. */
  LOG_PRETTY: envBoolean.default(false),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: envPort.default(8080),
  /** Za Ingressem: adresy albo podsieci proxy (adres klienta z X-Forwarded-For). */
  TRUST_PROXY: envTrustProxy.default([]),
  ALLOWED_ORIGINS: envOrigins,
  /** Mnożnik limitów żądań (tylko dev i test, np. długie E2E); w prod musi być 1. */
  RATE_LIMIT_FACTOR: z.coerce.number().int().min(1).max(1000).default(1),
});
export type BaseEnv = z.output<typeof baseEnvSchema>;

/** Reguły wspólne, do wywołania w `superRefine` schematu serwisu. */
export function refineBaseEnv(env: BaseEnv, ctx: z.RefinementCtx): void {
  if (env.APP_ENV !== 'prod') return;
  forbidInProd(ctx, 'LOG_PRETTY', env.LOG_PRETTY);
  forbidInProd(ctx, 'RATE_LIMIT_FACTOR', env.RATE_LIMIT_FACTOR !== 1);
}

/** Dodaje błąd, gdy w prod włączono coś tylko dla dev i testów (fałszywe adaptery itp.). */
export function forbidInProd(ctx: z.RefinementCtx, variable: string, enabled: boolean): void {
  if (enabled) {
    ctx.addIssue({ code: 'custom', path: [variable], message: 'not allowed when APP_ENV=prod' });
  }
}

export class EnvError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid environment:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    this.name = 'EnvError';
  }
}

/** Parsuje env schematem; rzuca EnvError z nazwami zmiennych i opisem, bez wartości. */
export function loadEnv<S extends z.ZodType>(
  schema: S,
  source: NodeJS.ProcessEnv = process.env,
): z.output<S> {
  // Puste zmienne traktujemy jak brak (compose i .env często zostawiają `VAR=`).
  const input = Object.fromEntries(Object.entries(source).filter(([, value]) => value !== ''));
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  const problems = result.error.issues.map((issue) => {
    const name = issue.path.map(String).join('.') || '(env)';
    const missing = issue.path.length === 1 && input[String(issue.path[0])] === undefined;
    // Domyślne komunikaty zod podają typy i ograniczenia, nie wartości (sprawdza env.test.ts).
    return `${name}: ${missing && issue.code !== 'custom' ? 'required' : issue.message}`;
  });
  throw new EnvError(problems);
}
