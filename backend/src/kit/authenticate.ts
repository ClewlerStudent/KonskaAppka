import type { FastifyRequest } from 'fastify';
import type { Principal } from '../lib/auth/claims.js';
import { TokenError, type AccessTokenVerifier } from '../lib/auth/verify.js';
import { ApiError } from './problem.js';

const BEARER_RE = /^Bearer +([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i;

function unauthorized(code: 'invalid_token' | 'token_expired'): ApiError {
  return new ApiError(code, {
    headers: { 'www-authenticate': `Bearer error="invalid_token"` },
  });
}

/** Trasa zewnętrzna: access token z `Authorization: Bearer`, inaczej 401. */
export async function authenticate(
  req: FastifyRequest,
  verifier: AccessTokenVerifier,
): Promise<Principal> {
  const match = BEARER_RE.exec(req.headers.authorization ?? '');
  if (!match?.[1]) throw unauthorized('invalid_token');
  try {
    return await verifier.verify(match[1]);
  } catch (error) {
    if (error instanceof TokenError) {
      req.log.info({ tokenError: error.message }, 'access token rejected');
      throw unauthorized(error.code);
    }
    throw error;
  }
}
