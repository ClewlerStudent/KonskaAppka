import type { z } from 'zod';
import { type AnyRoute, type RouteKind } from '../kit/route.js';
import { CLIENT_HEADER, ERRORS, commonSchemas, type ErrorCode } from './common.js';
import { inlineSchema, schemaRef, toComponentSchemas, type JsonSchema } from './registry.js';
import type { ServiceContract } from './index.js';

export type OpenApiDocument = JsonSchema & {
  paths: Record<string, Record<string, JsonSchema>>;
};

/** Trasy publikowane w OpenAPI: zewnętrzne i otwarte (wewnętrzne zostają w klastrze). */
export const isPublicRoute = (route: { kind: RouteKind }): boolean => route.kind !== 'internal';

const problemContent = { 'application/problem+json': { schema: schemaRef('Problem') } };

function headerObjects(headers: Readonly<Record<string, string>> | undefined) {
  if (!headers) return undefined;
  return Object.fromEntries(
    Object.entries(headers).map(([name, description]) => [
      name,
      { description, schema: { type: 'string' } },
    ]),
  );
}

function parameters(route: AnyRoute): JsonSchema[] {
  const list: JsonSchema[] = [];
  const add = (location: 'path' | 'query', object: z.ZodObject | undefined) => {
    if (!object) return;
    const required = new Set((inlineSchema(object).required as string[] | undefined) ?? []);
    for (const [name, field] of Object.entries(object.shape)) {
      list.push({
        name,
        in: location,
        required: location === 'path' || required.has(name),
        schema: inlineSchema(field as z.ZodType),
      });
    }
  };
  add('path', route.params);
  add('query', route.query);
  if (route.kind === 'open') list.push({ $ref: '#/components/parameters/EquenorClient' });
  return list;
}

function security(route: AnyRoute): JsonSchema[] | undefined {
  if (route.kind === 'external') return undefined; // domyślnie: accessToken
  switch (route.open?.credential) {
    case 'loginToken':
      return [{ loginToken: [] }];
    case 'refreshToken':
      return [{ refreshCookie: [] }, {}];
    default:
      return [];
  }
}

function errorResponses(codes: readonly ErrorCode[]): Record<string, JsonSchema> {
  const byStatus = new Map<number, ErrorCode[]>();
  for (const code of codes) {
    const { status } = ERRORS[code];
    byStatus.set(status, [...(byStatus.get(status) ?? []), code]);
  }
  return Object.fromEntries(
    [...byStatus.entries()]
      .sort(([a], [b]) => a - b)
      .map(([status, list]) => [
        String(status),
        {
          description: list.join(', '),
          ...(list.includes('rate_limited')
            ? { headers: headerObjects({ 'Retry-After': 'Sekundy do następnej próby' }) }
            : {}),
          content: problemContent,
        },
      ]),
  );
}

export function buildOpenApi(service: string, contract: ServiceContract): OpenApiDocument {
  const schemas = { ...commonSchemas, ...contract.schemas };
  const idOf = new Map<z.ZodType, string>(Object.entries(schemas).map(([id, s]) => [s, id]));
  const ref = (route: AnyRoute, schema: z.ZodType): JsonSchema => {
    const id = idOf.get(schema);
    if (!id) throw new Error(`${route.operationId}: schema is not in ${service} contract schemas`);
    return schemaRef(id);
  };

  const paths: OpenApiDocument['paths'] = {};
  for (const route of contract.routes.filter(isPublicRoute)) {
    const responses: Record<string, JsonSchema> = {};
    for (const [status, spec] of Object.entries(route.responses)) {
      responses[status] = {
        description: spec.description,
        ...(spec.headers ? { headers: headerObjects(spec.headers) } : {}),
        ...(spec.schema
          ? { content: { 'application/json': { schema: ref(route, spec.schema) } } }
          : {}),
      };
    }
    Object.assign(responses, errorResponses(route.errors), {
      default: { description: 'Inny błąd (problem+json)', content: problemContent },
    });

    const params = parameters(route);
    const sec = security(route);
    const operation: JsonSchema = {
      operationId: route.operationId,
      summary: route.summary,
      tags: [service],
      ...(sec ? { security: sec } : {}),
      'x-equenor-kind': route.kind,
      ...(route.open
        ? { 'x-equenor-open': { reason: route.open.reason, rateLimit: route.open.rateLimit } }
        : {}),
      ...(params.length > 0 ? { parameters: params } : {}),
      ...(route.body
        ? {
            requestBody: {
              required: true,
              content: { 'application/json': { schema: ref(route, route.body) } },
            },
          }
        : {}),
      responses,
    };
    (paths[route.path] ??= {})[route.method.toLowerCase()] = operation;
  }

  return {
    openapi: '3.1.0',
    info: { title: `EQUENOR ${service}`, version: '1' },
    security: [{ accessToken: [] }],
    tags: [{ name: service }],
    paths,
    components: {
      schemas: toComponentSchemas(schemas),
      parameters: {
        EquenorClient: {
          name: CLIENT_HEADER,
          in: 'header',
          required: false,
          description: 'Wymagany od przeglądarki (z nagłówkiem Origin) i przy refresh z ciasteczka',
          schema: { type: 'string', enum: ['web'] },
        },
      },
      securitySchemes: {
        accessToken: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        loginToken: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Login <loginToken> z POST /auth/v1/login',
        },
        refreshCookie: { type: 'apiKey', in: 'cookie', name: '__Secure-eq_rt' },
      },
    },
  };
}
