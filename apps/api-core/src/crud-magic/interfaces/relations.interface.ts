// crud-magic/src/interfaces/relations.interface.ts

/**
 * RelationsInterface
 *
 * Métodos mínimos para validar y popular relaciones:
 *  - validateRelations: asegura que los IDs de relación en el body existan y el usuario tenga permiso de leer la entidad relacionada.
 *  - applyPopulate: construye el objeto “.populate(...)” para Mongoose según la configuración.
 */
export interface RelationsInterface {
  validateRelations(
    tenantId: string,
    user: any,
    entityName: string,
    relationsInBody: Record<string, any>,
  ): Promise<void>;

  applyPopulate(
    tenantId: string,
    entityName: string,
    query: any,       // query de Mongoose (ej. Model.find(filter))
    populateFields?: string[],
  ): any; // devuelve el query con populate aplicado
}
