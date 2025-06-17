import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que convierte toda la cadena a mayúsculas.
 */
export class ToUpperAdapter implements Adapter<string, string> {
  /**
   * Transforma todos los caracteres de la cadena a mayúsculas.
   * @param value - Cadena original.
   * @returns Cadena en mayúsculas.
   */
  apply(value: string): string {
    return value.toUpperCase();
  }
}
