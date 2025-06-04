// crud-magic/src/services/import-export.service.ts

import { Injectable } from '@nestjs/common';

/**
 * ImportExportService
 *
 * - exportCsv(): recibe filtros, genera Buffer de CSV con todas las filas correspondient
 * - importCsv(): parsea un Buffer CSV y crea actualiza documentos en la colección
 *
 * Sprint 5: implementar con alguna librería tipo papaparse o csv-parse.
 */
@Injectable()
export class ImportExportService {
  async exportCsv(
    tenantId: string,
    user: any,
    entityName: string,
    filter: any,
  ): Promise<Buffer> {
    throw new Error('ImportExportService.exportCsv: not implemented');
  }

  async importCsv(
    tenantId: string,
    user: any,
    entityName: string,
    csvBuffer: Buffer,
  ): Promise<void> {
    throw new Error('ImportExportService.importCsv: not implemented');
  }
}
