import type { z } from 'zod';
import type { AnyRoute } from './route.js';
import { ApiError, type FieldError } from './problem.js';

export type InputPart = 'body' | 'params' | 'query';

/** Błędy walidacji bez wartości z żądania: ścieżka pola i komunikat zod (typy, limity). */
export function fieldErrors(error: z.ZodError, part: InputPart): FieldError[] {
  return error.issues.map((issue) => ({
    path: [part, ...issue.path.map(String)].join('.'),
    message: issue.message,
  }));
}

/** Parsuje część żądania schematem trasy; zły kształt daje 400 validation_failed. */
export function parseInput<S extends z.ZodType>(
  schema: S,
  value: unknown,
  part: InputPart,
): z.output<S> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  throw new ApiError('validation_failed', { errors: fieldErrors(result.error, part) });
}

export class ResponseContractError extends Error {
  constructor(route: AnyRoute, status: number, reason: string) {
    super(`${route.operationId}: response ${status} breaks the contract (${reason})`);
    this.name = 'ResponseContractError';
  }
}

export interface CheckedResponse {
  /** Treść po schemacie: bez pól spoza kontraktu. */
  readonly body: unknown;
  /** Ścieżki pól spoza kontraktu (bez wartości), które schemat wyciął. */
  readonly extraFields: readonly string[];
}

/** Sprawdza odpowiedź z kontraktem; niezgodny kształt albo status to ResponseContractError (500). */
export function checkResponse(route: AnyRoute, status: number, body: unknown): CheckedResponse {
  const spec = route.responses[status];
  if (!spec) throw new ResponseContractError(route, status, 'status not in contract');
  if (!spec.schema) {
    if (body !== undefined) throw new ResponseContractError(route, status, 'unexpected body');
    return { body: undefined, extraFields: [] };
  }
  const result = spec.schema.safeParse(body);
  if (!result.success) {
    const paths = result.error.issues.map((issue) => issue.path.join('.') || '(root)');
    throw new ResponseContractError(route, status, `invalid at ${paths.join(', ')}`);
  }
  return { body: result.data, extraFields: extraFields(body, result.data, []) };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** Pola obecne w `input`, których nie ma w `output` (wyniku parsowania schematem). */
function extraFields(input: unknown, output: unknown, path: readonly string[]): string[] {
  if (Array.isArray(input) && Array.isArray(output)) {
    return input.flatMap((item, i) => extraFields(item, output[i], [...path, String(i)]));
  }
  if (!isPlainObject(input) || !isPlainObject(output)) return [];
  return Object.entries(input).flatMap(([key, value]) => {
    if (value === undefined) return [];
    if (!(key in output)) return [[...path, key].join('.')];
    return extraFields(value, output[key], [...path, key]);
  });
}
