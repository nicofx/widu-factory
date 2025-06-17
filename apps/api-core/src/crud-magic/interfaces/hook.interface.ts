// src/crud-magic/interfaces/hook.interface.ts

export interface ICrudHookService {
  beforeCreate?(entity: any, context: any): Promise<void>;
  afterCreate?(entity: any, context: any): Promise<void>;
  beforeUpdate?(existing: any, updates: any, context: any): Promise<void>;
  afterUpdate?(updated: any, context: any): Promise<void>;
  beforeDelete?(existing: any, context: any): Promise<void>;
  afterDelete?(deleted: any, context: any): Promise<void>;
}
