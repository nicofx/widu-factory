// crud-magic/src/interfaces/entity-feature.interface.ts

import { Schema } from 'mongoose';

/**
 * EntityFeature
 *
 * Configuración de cada entidad que expondremos con CRUD automático:
 *  - name: nombre de la entidad/modelo (ej. 'Product')
 *  - schema: Schema de Mongoose
 *  - permisos: objeto { create: string, read: string, update: string, delete: string }
 *      → claves de permisos en tu sistema HACL (p.ej. 'products.create', ...)
 *  - filtros: definición de qué campos se pueden filtrar (texto, exactitud, rango)
 *  - relaciones: array de relaciones a popular (campo, modelo a popular, permisos de acceso)
 *  - softDelete: booleano (si habilita soft‐delete para esta entidad)
 *  - audit: booleano (si habilita auditoría para create/update/delete)
 *  - importExport: booleano (habilita importar/exportar CSV)
 *  - bulkOps: booleano (habilita operaciones masivas)
 *  - fieldLevelAuth: booleano (habilita protecciones a nivel de campo)
 *  - protectedFields: mapa de { campo: permisoRequerido }
 *  - hooks específicos de esta entidad: { beforeCreate: [], afterUpdate: [], ... }
 *  - relationsPopulateDefault: array de nombres de campos que se deben popular por defecto.
 */
export interface EntityFeature {
  name: string;
  schema: Schema;
  permisos: {
    create: string;
    read: string;
    update: string;
    delete: string;
  };
  filtros?: {
    buscarTexto?: string[];      // campos donde buscar texto
    camposExactos?: string[];    // campos de coincidencia exacta
    camposRango?: string[];      // campos numéricos/fecha donde filtrar rangos
  };
  relaciones?: Array<{
    campo: string;
    model: string;
    permisoLeer?: string;
  }>;
  softDelete?: boolean;
  audit?: boolean;
  importExport?: boolean;
  bulkOps?: boolean;
  fieldLevelAuth?: boolean;
  protectedFields?: Record<string, string>; // { campo: permiso }
  hooks?: {
    beforeCreate?: string[];
    afterCreate?: string[];
    beforeUpdate?: string[];
    afterUpdate?: string[];
    beforeDelete?: string[];
    afterDelete?: string[];
  };
  relationsPopulateDefault?: string[];
}
