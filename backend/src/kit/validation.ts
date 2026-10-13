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

/** Sprawdza odpowiedź z kontraktem (poza prod); zwraca treść po schemacie (bez nadmiarowych pól). */
export function checkResponse(route: AnyRoute, status: number, body: unknown): unknown {
  const spec = route.responses[status];
  if (!spec) throw new ResponseContractError(route, status, 'status not in contract');
  if (!spec.schema) {
    if (body !== undefined) throw new ResponseContractError(route, status, 'unexpected body');
    return undefined;
  }
  const result = spec.schema.safeParse(body);
  if (!result.success) {
    const paths = result.error.issues.map((issue) => issue.path.join('.') || '(root)');
    throw new ResponseContractError(route, status, `invalid at ${paths.join(', ')}`);
  }
  return result.data;
}
