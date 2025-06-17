import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que convierte un string, timestamp o Date a Date válido o null.
 */
export class ParseDateAdapter implements Adapter<string | number | Date, Date | null> {
  /**
   * Intenta crear un Date; si es inválido, devuelve null.
   * @param value - String, número o Date.
   * @returns Date o null.
   */
  apply(value: string | number | Date): Date | null {
    const date = value instanceof Date ? value : new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
}
