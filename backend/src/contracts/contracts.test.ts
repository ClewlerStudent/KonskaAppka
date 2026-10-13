import { readFileSync } from 'node:fs';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { routeKey, type RouteBody, type RouteReply } from '../kit/route.js';
import { getMe, login, type logout } from './auth.js';
import { ERRORS } from './common.js';
import { serviceNames, services } from './index.js';
import { buildOpenApi } from './openapi.js';

const allRoutes = serviceNames.flatMap((name) => services[name].routes);

describe('contracts', () => {
  it.each(serviceNames)('openapi/%s.json is up to date (npm run openapi)', (name) => {
    const file = new URL(`../../openapi/${name}.json`, import.meta.url);
    const committed: unknown = JSON.parse(readFileSync(file, 'utf8'));
    expect(buildOpenApi(name, services[name]), 'uruchom npm run openapi').toEqual(committed);
  });

  it('has unique operationIds and method+path pairs', () => {
    const ids = allRoutes.map((r) => r.operationId);
    const keys = allRoutes.map(routeKey);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('prefixes every route with its service', () => {
    for (const name of serviceNames) {
      for (const route of services[name].routes) expect(route.path).toMatch(`/${name}/v1/`);
    }
  });

  it('lists exactly the open routes from open-routes.txt', () => {
    const listed = readFileSync(new URL('../../open-routes.txt', import.meta.url), 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('#'));
    const open = allRoutes.filter((r) => r.kind === 'open').map(routeKey);
    expect(open.sort()).toEqual([...listed].sort());
  });

  it.each(serviceNames)('%s: OpenAPI has no internal routes', (name) => {
    const doc = buildOpenApi(name, services[name]);
    const internal = services[name].routes.filter((r) => r.kind === 'internal');
    for (const route of internal) {
      expect(doc.paths[route.path]?.[route.method.toLowerCase()]).toBeUndefined();
    }
    expect(JSON.stringify(doc)).not.toMatch(/\/internal\/|\.well-known/);
  });

  it.each(serviceNames)('%s: every listed error has a problem+json response', (name) => {
    const doc = buildOpenApi(name, services[name]);
    for (const route of services[name].routes.filter((r) => r.kind !== 'internal')) {
      const responses = doc.paths[route.path]?.[route.method.toLowerCase()]?.responses as Record<
        string,
        { description: string; content?: Record<string, unknown> }
      >;
      for (const code of route.errors) {
        const response = responses[String(ERRORS[code].status)];
        expect(response?.description, `${route.operationId}: ${code}`).toContain(code);
        expect(response?.content).toHaveProperty(['application/problem+json']);
      }
      expect(responses.default?.content).toHaveProperty(['application/problem+json']);
    }
  });

  it('marks open routes with rate limits and external routes with the default token', () => {
    const doc = buildOpenApi('auth', services.auth);
    expect(doc.security).toEqual([{ accessToken: [] }]);
    expect(doc.paths['/auth/v1/me']?.get).not.toHaveProperty('security');
    expect(doc.paths['/auth/v1/login']?.post?.security).toEqual([]);
    expect(doc.paths['/auth/v1/login']?.post?.['x-equenor-open']).toMatchObject({
      rateLimit: expect.arrayContaining([expect.objectContaining({ by: 'ip' })]) as unknown,
    });
  });
});

describe('route type helpers', () => {
  it('infer bodies and replies from descriptors', () => {
    expectTypeOf<RouteBody<typeof login>>().toEqualTypeOf<{
      login: string;
      password: string;
      clientId: 'web' | 'mobile' | 'tablet';
    }>();
    expectTypeOf<RouteBody<typeof getMe>>().toEqualTypeOf<undefined>();
    expectTypeOf<RouteReply<typeof logout>>().toEqualTypeOf<{ status: 204; body: undefined }>();
    expectTypeOf<RouteReply<typeof getMe>['body']['startView']>().toEqualTypeOf<'welcome'>();
    expectTypeOf(getMe.kind).toEqualTypeOf<'external'>();
    expectTypeOf(login.kind).toEqualTypeOf<'open'>();
  });
});
