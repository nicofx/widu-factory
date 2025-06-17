import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que limita un número al rango [min, max].
 */
export class ClampNumberAdapter implements Adapter<number, number> {
  constructor(private min: number, private max: number) {}

  /**
   * Si value < min devuelve min, si > max devuelve max, si no devuelve value.
   * @param value - Número a limitar.
   * @returns Número dentro de [min, max].
   */
  apply(value: number): number {
    return Math.min(Math.max(value, this.min), this.max);
  }
}
