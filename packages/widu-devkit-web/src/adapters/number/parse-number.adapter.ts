import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que intenta convertir un string o número a un número válido.
 * Si la conversión falla, devuelve el valor por defecto (por defecto 0).
 */
export class ParseNumberAdapter implements Adapter<string | number, number> {
  constructor(private defaultValue = 0) {}

  /**
   * Parsea el valor a float o devuelve defaultValue si es NaN.
   * @param value - String o número a parsear.
   * @returns Número parseado o defaultValue.
   */
  apply(value: string | number): number {
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? this.defaultValue : num;
  }
}
