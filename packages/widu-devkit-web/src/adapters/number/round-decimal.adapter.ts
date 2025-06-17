import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que redondea un número a N decimales.
 */
export class RoundDecimalAdapter implements Adapter<number, number> {
  constructor(private decimals: number) {}

  /**
   * Redondea value a los decimales indicados.
   * @param value - Número original.
   * @returns Número redondeado.
   */
  apply(value: number): number {
    const factor = 10 ** this.decimals;
    return Math.round(value * factor) / factor;
  }
}
