// crud-magic/src/interfaces/crud-magic-options.interface.ts

/**
 * Opciones globales para CrudMagicModule.forRoot()
 *
 * Aquí definimos parámetros como:
 *  - defaultPageSize, maxPageSize
 *  - cache (activar o desactivar, TTL)
 *  - rateLimit (ventana, máximo)
 *  - i18n (locales soportados, local por defecto)
 *  - metrics (booleano para activar contadores)
 *  - hooks: array global de hooks que se apliquen a todas las entidades
 *
 * En cada sprint iremos agregando nuevas propiedades a esta interfaz según lo acordado.
 */
export interface CrudMagicOptions {
  defaultPageSize?: number;
  maxPageSize?: number;

  cache?: {
    enabled: boolean;
    ttlSeconds: number;
  };

  rateLimit?: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };

  i18n?: {
    enabled: boolean;
    locales: string[];
    defaultLocale: string;
  };

  metrics?: {
    enabled: boolean;
  };

  hooks?: {
    // Hooks globales que se apliquen a todas las entidades
    beforeCreate?: string[];
    afterCreate?: string[];
    // etc…
  };
}
