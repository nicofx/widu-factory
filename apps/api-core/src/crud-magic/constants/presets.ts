// libs/crud-magic/src/constants/presets.ts
import { EntityFeature } from '../interfaces/entity-feature.interface';

export type CrudPreset = 'simpleCrud' | 'catalog';

export const PRESETS: Record<CrudPreset, Partial<EntityFeature>> = {
  simpleCrud: {
    softDelete: true,
    audit: true,
    importExport: false,
    bulkOps: false,
  },
  catalog: {
    softDelete: false,
    audit: false,
    importExport: true,
    bulkOps: true,
  },
};
