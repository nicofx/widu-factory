import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que suma una cantidad de días a una fecha.
 */
export class AddDaysAdapter implements Adapter<{ date: Date | string | number; days: number }, Date> {
  /**
   * @param value.date - Fecha base.
   * @param value.days - Días a sumar (puede ser negativo).
   * @returns Nueva Date con days añadidos.
   */
  apply(value: { date: Date | string | number; days: number }): Date {
    const date = value.date instanceof Date ? new Date(value.date) : new Date(value.date);
    date.setDate(date.getDate() + value.days);
    return date;
  }
}
