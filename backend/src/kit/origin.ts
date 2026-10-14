import type { FastifyRequest } from 'fastify';
import { CLIENT_HEADER } from '../contracts/common.js';
import { ApiError } from './problem.js';

/**
 * Trasy otwarte wołane z przeglądarki (login CSRF, docs/mikroserwisy.md 3.7): żądanie z nagłówkiem
 * Origin musi mieć origin z listy i nagłówek X-Equenor-Client: web, który wymusza preflight CORS.
 * Żądania bez Origin (apka, tablet, CLI, testy) tych warunków nie mają.
 */
export function isBrowserRequest(req: FastifyRequest): boolean {
  return req.headers.origin !== undefined;
}

export function assertAllowedBrowserOrigin(
  req: FastifyRequest,
  allowedOrigins: ReadonlySet<string>,
): void {
  const origin = req.headers.origin;
  if (origin === undefined) return;
  if (!allowedOrigins.has(origin) || req.headers[CLIENT_HEADER] !== 'web') {
    throw new ApiError('origin_not_allowed');
  }
}

/** Przeglądarka to zawsze aplikacja `web`: inny `clientId` w treści daje 403 client_not_allowed. */
export function assertBrowserClientId(req: FastifyRequest, body: unknown): void {
  if (!isBrowserRequest(req) || typeof body !== 'object' || body === null) return;
  if ('clientId' in body && body.clientId !== 'web') throw new ApiError('client_not_allowed');
}
