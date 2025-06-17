// apps/api-core/src/common/guards/roles.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    // Si no hay roles definidos, dejamos pasar
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // viene del JwtStrategy

    // user.roles debe existir en payload del token
    const userRoles: string[] = user?.roles || [];

    // Chequeamos si alguno de los roles del user coincide con los requeridos
    const hasRole = userRoles.some((r) => requiredRoles.includes(r));
    if (!hasRole) {
      // Log de intento de acceso denegado
      this.logger.warn(
        `Acceso denegado. userId=${user?.userId} tenantId=${user?.tenantId} ` +
        `ruta=${request.method} ${request.url} falta rol en [${requiredRoles.join(',')}]`,
      );
      throw new ForbiddenException('No tienes el rol necesario para acceder.');
    }
    return true;
  }
}
