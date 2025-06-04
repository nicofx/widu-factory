// crud-magic/src/interfaces/response-format.interface.ts

/**
 * ResponseFormat
 *
 * Para estandarizar las respuestas de findAll y findOne.
 */
export interface ResponseFormat<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  elapsedMs: number;
}
