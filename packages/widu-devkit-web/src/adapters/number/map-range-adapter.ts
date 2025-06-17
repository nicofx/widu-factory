import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que mapea un número de un rango [inMin,inMax] a [outMin,outMax].
 */
export class MapRangeAdapter implements Adapter<number, number> {
  constructor(
    private inMin: number,
    private inMax: number,
    private outMin: number,
    private outMax: number
  ) {}

  /**
   * Mapea value de [inMin,inMax] a [outMin,outMax].
   * @param value - Número a transformar.
   * @returns Número mapeado proporcionalmente.
   */
  apply(value: number): number {
    const ratio = (value - this.inMin) / (this.inMax - this.inMin);
    return this.outMin + ratio * (this.outMax - this.outMin);
  }
}
