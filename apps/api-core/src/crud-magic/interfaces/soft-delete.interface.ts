// crud-magic/src/interfaces/soft-delete.interface.ts

/**
 * SoftDeleteInterface
 *
 * Métodos mínimos que nuestro SoftDeleteService debe exponer:
 *  - applySoftDeleteFlag: antes de eliminar físicamente, marcar el documento con “deleted: true” o un campo equivalente.
 *  - filterDeleted: al buscar (findAll/findOne), agregar condición para excluir “deleted: true”.
 */
export interface SoftDeleteInterface {
  applySoftDeleteFlag(
    tenantId: string,
    entityName: string,
    id: string,
  ): Promise<void>;

  filterDeleted(
    tenantId: string,
    entityName: string,
    baseFilter: any,
  ): any;
}
