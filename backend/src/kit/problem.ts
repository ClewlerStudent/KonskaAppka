import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ERRORS, PROBLEM_TYPE_PREFIX, type ErrorCode, type Problem } from '../contracts/common.js';

export const PROBLEM_CONTENT_TYPE = 'application/problem+json; charset=utf-8';

export interface FieldError {
  readonly path: string;
  readonly message: string;
}

export interface ApiErrorOptions {
  /** Opis dla dewelopera; nigdy z wartościami z żądania. */
  readonly detail?: string;
  readonly errors?: readonly FieldError[];
  readonly headers?: Readonly<Record<string, string>>;
}

/** Błąd API z kodem z contracts/common.ts; error handler zamienia go na problem+json. */
export class ApiError extends Error {
  readonly status: number;

  constructor(
    readonly code: ErrorCode,
    readonly options: ApiErrorOptions = {},
  ) {
    super(ERRORS[code].title);
    this.name = 'ApiError';
    this.status = ERRORS[code].status;
  }
}

export function problemBody(code: ErrorCode, options: ApiErrorOptions = {}): Problem {
  const { status, title } = ERRORS[code];
  return {
    type: `${PROBLEM_TYPE_PREFIX}${code}`,
    title,
    status,
    code,
    ...(options.detail ? { detail: options.detail } : {}),
    ...(options.errors && options.errors.length > 0 ? { errors: [...options.errors] } : {}),
  };
}

export function sendProblem(
  reply: FastifyReply,
  code: ErrorCode,
  options: ApiErrorOptions = {},
): FastifyReply {
  for (const [name, value] of Object.entries(options.headers ?? {})) reply.header(name, value);
  return reply
    .code(ERRORS[code].status)
    .type(PROBLEM_CONTENT_TYPE)
    .send(problemBody(code, options));
}

/** Błędy Fastify (parser treści, router) → nasze kody. */
const FASTIFY_CODES: Readonly<Record<string, ErrorCode>> = {
  FST_ERR_CTP_BODY_TOO_LARGE: 'payload_too_large',
  FST_ERR_CTP_INVALID_MEDIA_TYPE: 'unsupported_media_type',
  FST_ERR_CTP_INVALID_CONTENT_LENGTH: 'validation_failed',
  FST_ERR_CTP_EMPTY_JSON_BODY: 'validation_failed',
  FST_ERR_CTP_INVALID_JSON_BODY: 'validation_failed',
};

function codeForStatus(status: number | undefined): ErrorCode {
  switch (status) {
    case 400:
      return 'validation_failed';
    case 404:
      return 'not_found';
    case 413:
      return 'payload_too_large';
    case 415:
      return 'unsupported_media_type';
    case 429:
      return 'rate_limited';
    case 503:
      return 'not_ready';
    default:
      return 'internal_error';
  }
}

/** Jeden format błędów dla każdej instancji Fastify serwisu (port zewnętrzny i wewnętrzne). */
export function registerErrorHandling(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | ApiError, req: FastifyRequest, reply) => {
    if (error instanceof ApiError) {
      req.log.info({ problem: error.code, status: error.status }, 'request rejected');
      return sendProblem(reply, error.code, error.options);
    }
    const code =
      (error.code ? FASTIFY_CODES[error.code] : undefined) ?? codeForStatus(error.statusCode);
    if (code === 'internal_error') {
      req.log.error({ err: error }, 'unhandled error');
    } else {
      req.log.info({ problem: code, fastifyCode: error.code }, 'request rejected');
    }
    // Komunikat błędu Fastify może cytować treść żądania (np. błąd parsera JSON), więc bez `detail`.
    return sendProblem(reply, code);
  });

  app.setNotFoundHandler((_req, reply) => sendProblem(reply, 'not_found'));
}
