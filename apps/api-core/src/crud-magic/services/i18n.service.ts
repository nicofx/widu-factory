// crud-magic/src/services/i18n.service.ts

import { Injectable } from '@nestjs/common';

/**
 * I18nService
 *
 * - translate(key: string, locale?: string, variables?: any): string
 *   Función que lee archivos JSON de idioma (p.ej. en /i18n/es.json) y devuelve texto traducido.
 *
 * Sprint 6: implementar lectura de archivos y reemplazo de variables dinámicas.
 */
@Injectable()
export class I18nService {
  translate(
    key: string,
    locale?: string,
    variables?: Record<string, any>,
  ): string {
    throw new Error('I18nService.translate: not implemented');
  }
}
