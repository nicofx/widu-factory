import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que elimina acentos de letras en la cadena.
 * Ej: "camión" → "camion"
 */
export class RemoveAccentsAdapter implements Adapter<string, string> {
  /**
   * Normaliza la cadena y quita marcas diacríticas.
   * @param value - Cadena original con posibles acentos.
   * @returns Cadena sin acentos.
   */
  apply(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
