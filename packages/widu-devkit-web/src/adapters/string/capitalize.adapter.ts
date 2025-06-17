import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que capitaliza la primera letra de la cadena.
 * No modifica el resto de caracteres.
 */
export class CapitalizeAdapter implements Adapter<string, string> {
  /**
   * Convierte la primera letra a mayúscula.
   * @param value - Cadena original.
   * @returns Cadena con primera letra en mayúscula.
   */
  apply(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
