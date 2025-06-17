// src/crud-magic/interfaces/entity-options.interface.ts
import { Schema } from 'mongoose';

export interface EntityCrudOptions {
  name: string;        // p.ej. 'Product' → ruta '/products'
  schema: Schema;
  primaryKey?: string; // por defecto '_id'

  permisos?: {
    create: string;
    read: string;
    update: string;
    delete: string;
  };

  filtros?: {
    buscarTexto?: string[];
    camposExactos?: string[];
    camposIn?: string[];
    camposRango?: string[];
  };

  relaciones?: Array<{ campo: string; model: string }>;

  softDelete?: boolean;
  history?: boolean;
  audit?: boolean;
  exportCsv?: boolean;
  importCsv?: boolean;
  fieldLevelAuth?: boolean;
  protectedFields?: Record<string, string>; // { campo: permisoRequerido }
  hooks?: Array<new () => any>;
  mixins?: Array<new () => any>;
  populateDefaults?: string[];
  // ...otros flags específicos
}
