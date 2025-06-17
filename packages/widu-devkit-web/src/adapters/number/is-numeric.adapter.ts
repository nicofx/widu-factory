import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que verifica si un string o número es numérico válido.
 */
export class IsNumericAdapter implements Adapter<string | number, boolean> {
  /**
   * Retorna true si value es un número o string numérico válido.
   * @param value - String o número a verificar.
   * @returns Boolean indicando si es numérico.
   */
  apply(value: string | number): boolean {
    if (typeof value === 'number') {
      return !isNaN(value);
    }
    const parsed = parseFloat(value);
    return !isNaN(parsed) && isFinite(parsed);
  }
}
