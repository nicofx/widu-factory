// src/crud-magic/interfaces/crud-options.interface.ts
export interface GlobalCrudOptions {
  defaultPageSize?: number;
  maxPageSize?: number;
  cache?: { ttlSeconds: number };
  rateLimit?: { windowMs: number; max: number };
  i18n?: { locales: string[]; defaultLocale: string };
  metrics?: boolean;
  // ...otros flags globales
}
