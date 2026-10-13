import type { AnyRoute } from '../kit/route.js';
import { authRoutes, authSchemas } from './auth.js';
import type { SchemaRecord } from './registry.js';

export interface ServiceContract {
  readonly routes: readonly AnyRoute[];
  /** Schematy publikowane w OpenAPI; każda treść trasy zewnętrznej i otwartej musi tu być. */
  readonly schemas: SchemaRecord;
}

export const services = {
  auth: { routes: authRoutes, schemas: authSchemas },
} as const satisfies Record<string, ServiceContract>;

export type ServiceName = keyof typeof services;

export const serviceNames = Object.keys(services) as ServiceName[];
