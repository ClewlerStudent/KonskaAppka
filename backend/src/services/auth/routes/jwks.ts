import { getJwks } from '../../../contracts/auth.js';
import type { Service } from '../../../kit/service.js';
import type { RouteDeps } from '../deps.js';

/** JWKS tylko na porcie wewnętrznym `jwks` (kit rejestruje trasę `internal` na jej porcie). */
export function registerJwksRoutes(service: Service, deps: RouteDeps): void {
  service.route(getJwks, ({ reply }) => {
    reply.header('cache-control', 'public, max-age=300');
    return Promise.resolve({ status: 200, body: deps.signer.publicJwks() });
  });
}
