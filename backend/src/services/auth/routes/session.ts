import type { FastifyReply } from 'fastify';
import { logout, refreshToken, REFRESH_COOKIE } from '../../../contracts/auth.js';
import { CLIENT_HEADER, ClientIdSchema, type ClientId } from '../../../contracts/common.js';
import { epochSeconds } from '../../../kit/clock.js';
import { ApiError } from '../../../kit/problem.js';
import type { Service } from '../../../kit/service.js';
import type { RouteDeps } from '../deps.js';
import { isClientAllowed } from '../tokens/claims.js';
import type { IssuedSession } from '../tokens/issue.js';

/**
 * Ciasteczko refresh tokenu panelu web (docs/mikroserwisy.md 3.7). Zawsze `Secure`
 * z prefiksem `__Secure-`, także w dev: Chromium i Firefox traktują http://localhost
 * jak bezpieczny kontekst i takie ciasteczko przyjmują; Safari może go nie zapisać
 * (wtedy po przeładowaniu panelu logowanie od nowa). Bez `Domain`: tylko host API.
 */
const COOKIE_OPTIONS = {
  path: REFRESH_COOKIE.path,
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
} as const;

export function setRefreshCookie(reply: FastifyReply, token: string, maxAgeSec: number): void {
  reply.setCookie(REFRESH_COOKIE.name, token, { ...COOKIE_OPTIONS, maxAge: maxAgeSec });
}

export function clearRefreshCookie(reply: FastifyReply): void {
  reply.setCookie(REFRESH_COOKIE.name, '', { ...COOKIE_OPTIONS, maxAge: 0 });
}

/** Odpowiedź z tokenami: panel web dostaje refresh token tylko w ciasteczku. */
export function tokenReplyBody(
  reply: FastifyReply,
  clientId: ClientId,
  issued: IssuedSession,
  nowSec: number,
) {
  const body = {
    accessToken: issued.accessToken,
    tokenType: 'Bearer' as const,
    expiresIn: issued.expiresIn,
  };
  if (clientId === 'web') {
    setRefreshCookie(reply, issued.refreshToken, issued.refreshExp - nowSec);
    return body;
  }
  return { ...body, refreshToken: issued.refreshToken };
}

export function registerSessionRoutes(service: Service, deps: RouteDeps): void {
  const { tokens, users, access, clock } = deps;

  service.route(refreshToken, async ({ req, reply, body }) => {
    let token: string;
    let viaCookie: boolean;
    if (body.refreshToken !== undefined) {
      token = body.refreshToken;
      viaCookie = false;
    } else {
      // Ciasteczko tylko z nagłówkiem X-Equenor-Client: web (wymusza preflight CORS).
      if (req.headers[CLIENT_HEADER] !== 'web') throw new ApiError('origin_not_allowed');
      const cookie = req.cookies[REFRESH_COOKIE.name];
      if (!cookie) throw new ApiError('session_revoked');
      token = cookie;
      viaCookie = true;
    }

    const claims = await tokens.verifyRefreshToken(token);
    if (!claims) throw new ApiError('session_revoked');
    const clientId = ClientIdSchema.safeParse(claims.client_id);
    // Refresh token panelu jedzie tylko w ciasteczku, a apki i tabletu tylko w treści.
    if (!clientId.success || viaCookie !== (clientId.data === 'web')) {
      throw new ApiError('wrong_client');
    }

    const user = await users.getById(claims.sub);
    if (!user || user.deletedAt) throw new ApiError('session_revoked');
    if (user.tokenVersion !== claims.tv) throw new ApiError('session_revoked');
    const grants = await access.forUser(user.id);
    if (!isClientAllowed(user, grants, clientId.data)) throw new ApiError('wrong_client');

    const issued = await tokens.issueSession({
      user,
      clientId: clientId.data,
      grants,
      sid: claims.sid,
      sst: claims.sst,
    });
    if (!issued) throw new ApiError('session_revoked');
    return {
      status: 200,
      body: tokenReplyBody(reply, clientId.data, issued, epochSeconds(clock)),
    };
  });

  service.route(logout, ({ reply }) => {
    clearRefreshCookie(reply);
    return Promise.resolve({ status: 204, body: undefined });
  });
}
