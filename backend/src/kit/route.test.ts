import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { defineRoute, routeKey, toFastifyPath, type RouteInput } from './route.js';

const ok = { 200: { description: 'ok', schema: z.object({ a: z.string() }) } } as const;

// Deskryptor z pominięciem typów: sprawdzamy niezmienniki czasu wykonania.
const define = (def: Record<string, unknown>) =>
  defineRoute({
    operationId: 'test',
    method: 'GET',
    path: '/test/v1/things',
    summary: 'test',
    responses: ok,
    errors: [],
    ...def,
  } as unknown as RouteInput);

describe('defineRoute', () => {
  it('defaults to an external route that needs a token', () => {
    const route = defineRoute({
      operationId: 'getThing',
      method: 'GET',
      path: '/test/v1/things/{thingId}',
      summary: 'x',
      params: z.object({ thingId: z.uuid() }),
      responses: ok,
      errors: ['invalid_token'],
    });
    expect(route.kind).toBe('external');
    expect(Object.isFrozen(route)).toBe(true);
    expect(routeKey(route)).toBe('GET /test/v1/things/{thingId}');
    expect(toFastifyPath(route.path)).toBe('/test/v1/things/:thingId');
  });

  it('accepts a complete open route', () => {
    const body = z.object({ login: z.string() });
    const route = define({
      kind: 'open',
      method: 'POST',
      body,
      open: { reason: 'r', rateLimit: [{ by: 'login', max: 1, windowSec: 60 }] },
    });
    expect(route.kind).toBe('open');
  });

  it.each([
    ['open without open', { kind: 'open' }],
    ['open without reason', { kind: 'open', open: { reason: ' ', rateLimit: [] } }],
    ['open without rateLimit', { kind: 'open', open: { reason: 'r', rateLimit: [] } }],
    [
      'open with a bad rate rule',
      { kind: 'open', open: { reason: 'r', rateLimit: [{ by: 'ip', max: 0, windowSec: 60 }] } },
    ],
    [
      'loginToken key without loginToken credential',
      {
        kind: 'open',
        open: { reason: 'r', rateLimit: [{ by: 'loginToken', max: 1, windowSec: 1 }] },
      },
    ],
    [
      'login key without login in body',
      { kind: 'open', open: { reason: 'r', rateLimit: [{ by: 'login', max: 1, windowSec: 1 }] } },
    ],
    [
      'external with open',
      { open: { reason: 'r', rateLimit: [{ by: 'ip', max: 1, windowSec: 1 }] } },
    ],
    ['internal without internal', { kind: 'internal', path: '/test/v1/internal/x' }],
    [
      'internal without port',
      { kind: 'internal', path: '/test/v1/internal/x', internal: { port: '', callers: ['a'] } },
    ],
    [
      'internal without callers',
      { kind: 'internal', path: '/test/v1/internal/x', internal: { port: 'p', callers: [] } },
    ],
    [
      'internal outside /internal/',
      { kind: 'internal', path: '/test/v1/x', internal: { port: 'p', callers: ['a'] } },
    ],
    ['external on /internal/', { path: '/test/v1/internal/x' }],
    ['external on /.well-known/', { path: '/test/v1/.well-known/x' }],
    ['path without service prefix', { path: '/things' }],
    ['GET with body', { body: z.object({}) }],
    ['no 2xx response', { responses: {} }],
    ['error status in responses', { responses: { ...ok, 404: { description: 'x' } } }],
    ['duplicate errors', { errors: ['not_found', 'not_found'] }],
    ['params not matching path', { path: '/test/v1/things/{id}' }],
    ['bad operationId', { operationId: 'Get-thing' }],
  ])('rejects %s', (_name, def) => {
    expect(() => define(def)).toThrow();
  });
});
