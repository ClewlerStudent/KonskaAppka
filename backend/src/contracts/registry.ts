import { z } from 'zod';

export type SchemaRecord = Readonly<Record<string, z.ZodType>>;

export type JsonSchema = Record<string, unknown>;

export const schemaRef = (id: string): JsonSchema => ({ $ref: `#/components/schemas/${id}` });

/**
 * Zamienia nazwane schematy zod na `components.schemas` OpenAPI 3.1.
 * Schemat zagnieżdżony, który też jest na liście, staje się `$ref` (openapi-typescript
 * nie rozwiązuje lokalnych `$defs`, więc nazwy idą przez rejestr, nie przez `.meta({ id })`).
 */
export function toComponentSchemas(schemas: SchemaRecord): Record<string, JsonSchema> {
  const registry = z.registry<{ id: string }>();
  for (const [id, schema] of Object.entries(schemas)) registry.add(schema, { id });

  const out = z.toJSONSchema(registry, {
    target: 'draft-2020-12',
    io: 'input',
    uri: (id) => `#/components/schemas/${id}`,
  });

  return Object.fromEntries(
    Object.keys(schemas).map((id) => {
      const schema = out.schemas[id];
      if (!schema) throw new Error(`Schema ${id} missing from JSON Schema output`);
      const { $schema: _schema, $id: _id, ...rest } = schema as JsonSchema;
      return [id, rest];
    }),
  );
}

/** Schemat pola bez nazwy (parametry ścieżki i zapytania), bez `$schema`. */
export function inlineSchema(schema: z.ZodType): JsonSchema {
  const { $schema: _schema, ...rest } = z.toJSONSchema(schema, {
    target: 'draft-2020-12',
    io: 'input',
  }) as JsonSchema;
  return rest;
}
