// crud-magic/src/interfaces/import-export.interface.ts

/**
 * ImportExportInterface
 *
 * - exportCsv: recibe filtros y genera un CSV (podría devolver un stream o Buffer).
 * - importCsv: recibe un archivo CSV y lo parsea para crear/marcar registros.
 */
export interface ImportExportInterface {
  exportCsv(
    tenantId: string,
    user: any,
    entityName: string,
    filter: any,
  ): Promise<Buffer>;

  importCsv(
    tenantId: string,
    user: any,
    entityName: string,
    csvBuffer: Buffer,
  ): Promise<void>;
}
