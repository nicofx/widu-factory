import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que calcula la diferencia en días entre dos fechas.
 */
export class DateDiffDaysAdapter implements Adapter<{ from: Date | string | number; to: Date | string | number }, number> {
  /**
   * Retorna la diferencia entera en días (to - from).
   * @param value.from - Fecha inicial.
   * @param value.to - Fecha final.
   * @returns Número de días de diferencia.
   */
  apply(value: { from: Date | string | number; to: Date | string | number }): number {
    const toDate = value.to instanceof Date ? value.to : new Date(value.to);
    const fromDate = value.from instanceof Date ? value.from : new Date(value.from);
    if (isNaN(toDate.getTime()) || isNaN(fromDate.getTime())) return NaN;
    const diffMs = toDate.getTime() - fromDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}
