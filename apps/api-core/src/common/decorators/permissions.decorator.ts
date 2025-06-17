// apps/api-core/src/common/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

// Clave de metadata que usaremos en PermissionsGuard
export const PERMISSIONS_KEY = 'permissions';

/**
 * @Permissions('users.create', 'users.delete')
 * añade metadata ['users.create','users.delete'] al manejador
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
