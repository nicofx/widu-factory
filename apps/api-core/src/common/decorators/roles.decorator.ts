// apps/api-core/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

// Clave de metadata que usaremos en RolesGuard
export const ROLES_KEY = 'roles';

/**
 * @Roles('admin', 'manager')
 * añade metadata ['admin','manager'] al manejador
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
