import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que normaliza espacios en blanco:
 * - Reemplaza múltiples espacios por uno solo.
 * - Elimina espacios sobrantes al inicio y final.
 */
export class NormalizeWhitespaceAdapter implements Adapter<string, string> {
  /**
   * Aplica normalización de espacios.
   * @param value - Cadena original.
   * @returns Cadena con espacios normalizados.
   */
  apply(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }
}
