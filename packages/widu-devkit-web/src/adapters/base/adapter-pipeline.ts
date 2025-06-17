import { Adapter } from './adapter.interface';

/**
 * AdapterPipeline permite encadenar múltiples adapters que transforman
 * un valor de tipo T, aplicándolos uno tras otro en serie.
 *
 * Útil para construir pipelines de transformación atómicos y configurables.
 */
export class AdapterPipeline<T> implements Adapter<T, T> {
  /**
   * @param adapters - Array de Adapter<T,T> que se aplicarán en orden.
   */
  constructor(private adapters: Array<Adapter<T, T>>) {}

  /**
   * Aplica cada adapter en secuencia al valor inicial.
   *
   * Ejemplo:
   *   const pipeline = new AdapterPipeline<string>([
   *     new DefaultTrimAdapter(),
   *     new RemoveAccentsAdapter(),
   *     new ToLowerAdapter(),
   *   ]);
   *   pipeline.apply('  Acción ÉPICA  '); // → "acción épica" → "accion epica" → "accion epica"
   *
   * @param value - Valor de entrada de tipo T.
   * @returns Valor resultante tras aplicar todos los adapters.
   */
  apply(value: T): T {
    return this.adapters.reduce((current, adapter) => adapter.apply(current), value);
  }
}
