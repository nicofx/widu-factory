// crud-magic/src/decorators/crud.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * @Crud()
 *
 * Decorador para marcar un controlador como generador de rutas CRUD automático.
 * Opcionalmente podría definir nombre de ruta base o pipeline a usar.
 */
export const CRUD_KEY = 'CRUD_OPTIONS';

export function Crud(options?: { path?: string; pipeline?: string }) {
  return SetMetadata(CRUD_KEY, options || {});
}
