import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que remueve caracteres especiales no permitidos.
 * Permite letras, números, espacios y signos de puntuación básicos.
 */
export class RemoveSpecialCharsAdapter implements Adapter<string, string> {
  /**
   * Filtra caracteres que no sean:
   * - Letras (incluyendo acentos y ñ/Ñ)
   * - Dígitos
   * - Espacios
   * - .,;!?()- 
   * @param value - Cadena original.
   * @returns Cadena limpia de caracteres especiales.
   */
  apply(value: string): string {
    return value.replace(/[^\w\sáéíóúÁÉÍÓÚñÑ.,;!?()\-]/g, '');
  }
}
