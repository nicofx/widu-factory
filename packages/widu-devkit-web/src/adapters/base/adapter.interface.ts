/**
 * Adapter genérico que transforma un valor de tipo T a tipo R.
 * Ideal para crear pipelines de transformación atómicos.
 */
export interface Adapter<T = any, R = any> {
  /**
   * Aplica la transformación al valor dado.
   * @param value - Valor de entrada de tipo T.
   * @returns Valor transformado de tipo R.
   */
  apply(value: T): R;
}
