import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que convierte toda la cadena a minúsculas.
 */
export class ToLowerAdapter implements Adapter<string, string> {
  /**
   * Transforma todos los caracteres de la cadena a minúsculas.
   * @param value - Cadena original.
   * @returns Cadena en minúsculas.
   */
  apply(value: string): string {
    return value.toLowerCase();
  }
}
