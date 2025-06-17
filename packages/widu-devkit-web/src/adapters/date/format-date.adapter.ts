import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que formatea una fecha a "YYYY-MM-DD".
 */
export class FormatDateAdapter implements Adapter<Date | string | number, string> {
  /**
   * Convierte a Date y devuelve string en formato ISO básico.
   * @param value - Date, timestamp o string.
   * @returns Fecha formateada o '' si inválido.
   */
  apply(value: Date | string | number): string {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
