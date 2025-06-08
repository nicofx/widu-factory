// libs/crud-magic/src/typings.ts
export interface CrudContext {
  user?: { id: string; roles: string[] };
  tenantId?: string;
  [k: string]: any;
}

export type CrudHook<TModel, TDto = unknown> =
  (dto: TDto, context: CrudContext) => Promise<void> | void;
