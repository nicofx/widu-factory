import { Adapter } from '../base/adapter.interface';

/**
 * Adapter que convierte una cadena a un "slug" amigable para URLs:
 * - Elimina acentos.
 * - Quita caracteres no alfanuméricos.
 * - Reemplaza espacios por guiones.
 * - Convierte todo a minúsculas.
 */
export class SlugifyAdapter implements Adapter<string, string> {
  /**
   * Crea un slug a partir de la cadena.
   * @param value - Texto original.
   * @returns Slug en minúsculas y sin caracteres especiales.
   */
  apply(value: string): string {
    return value
      .normalize('NFD')                    // separar acentos
      .replace(/[\u0300-\u036f]/g, '')     // eliminar marcas diacríticas
      .replace(/[^\w\s-]/g, '')            // quitar no alfanuméricos
      .trim()                              // quitar espacios al inicio/fin
      .replace(/\s+/g, '-')                // espacios -> guiones
      .toLowerCase();                      // todo a minúsculas
  }
}
