import { authRoutes } from '../../contracts/auth.js';
import { routeKey } from '../../kit/route.js';
import { createService, type Service } from '../../kit/service.js';
import { loginRateKey } from './contact.js';
import type { AuthDeps } from './deps.js';
import { registerJwksRoutes } from './routes/jwks.js';
import { registerLoginRoutes } from './routes/login.js';
import { registerMeRoutes } from './routes/me.js';
import { registerSessionRoutes } from './routes/session.js';
import { registerSignUpRoutes } from './routes/sign-up.js';
import { createTokenService } from './tokens/issue.js';

/** Treści auth są małe (login, hasło, kod): limit niższy niż domyślne 64 KiB kit. */
export const AUTH_BODY_LIMIT = 16 * 1024;

/** Serwis auth bez nasłuchu (testy: `service.external.inject`, main.ts: `listen`). */
export async function buildAuthApp(deps: AuthDeps): Promise<Service> {
  const { config } = deps;
  const tokens = createTokenService({
    signer: deps.signer,
    issuer: config.issuer,
    clock: deps.clock,
  });

  const service = await createService({
    name: 'auth',
    appEnv: config.appEnv,
    logger: deps.logger,
    host: config.host,
    port: config.port,
    internalPorts: { jwks: config.jwksPort },
    allowedOrigins: config.allowedOrigins,
    trustProxy: config.trustProxy,
    clock: deps.clock,
    bodyLimit: AUTH_BODY_LIMIT,
    rateLimitFactor: config.rateLimitFactor,
    verifier: tokens.accessVerifier,
    loginRateKey,
  });

  const routeDeps = { ...deps, tokens };
  registerSignUpRoutes(service, routeDeps);
  registerLoginRoutes(service, routeDeps);
  registerSessionRoutes(service, routeDeps);
  registerMeRoutes(service, routeDeps);
  registerJwksRoutes(service, routeDeps);

  const registered = new Set(service.routes.map(routeKey));
  const missing = authRoutes.map(routeKey).filter((key) => !registered.has(key));
  if (missing.length > 0) throw new Error(`auth: routes without handlers: ${missing.join(', ')}`);

  await service.ready();
  return service;
}
