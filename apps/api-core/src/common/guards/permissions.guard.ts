// apps/api-core/src/common/guards/permissions.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPerms = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );
    // Si no hay permisos definidos, dejamos pasar
    if (!requiredPerms || requiredPerms.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // viene del JwtStrategy

    // user.permissions debe existir en payload del token
    const userPerms: string[] = user?.permissions || [];

    // Chequeamos que TODOS los permissions requeridos estén en user.permissions
    const hasAll = requiredPerms.every((p) => userPerms.includes(p));
    if (!hasAll) {
      this.logger.warn(
        `Acceso denegado. userId=${user?.userId} tenantId=${user?.tenantId} ` +
        `ruta=${request.method} ${request.url} faltan permisos en [${requiredPerms.join(
          ',',
        )}]`,
      );
      throw new ForbiddenException('No tienes los permisos necesarios para acceder.');
    }
    return true;
  }
}
