import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que verifica si un valor es una fecha válida.
 */
export class IsValidDateAdapter implements Adapter<string | number | Date, boolean> {
  /**
   * @param value - Fecha en string, número o Date.
   * @returns true si es Date válido.
   */
  apply(value: string | number | Date): boolean {
    const date = value instanceof Date ? value : new Date(value);
    return !isNaN(date.getTime());
  }
}
