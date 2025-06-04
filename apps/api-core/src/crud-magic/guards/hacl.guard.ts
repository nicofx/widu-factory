// crud-magic/src/guards/hacl.guard.ts

import { Injectable, ForbiddenException, SetMetadata, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HaclService } from '../services/hacl.service';

export const HACL_KEY = 'HACL_PERMISSION';

/**
 * @Hacl('users.read')  ⇒ guarda metadata HACL_KEY = 'users.read'
 */
export function Hacl(permissionKey: string): MethodDecorator {
  return SetMetadata(HACL_KEY, permissionKey);
}

@Injectable()
export class HaclGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly haclService: HaclService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permiso: string | undefined =
      this.reflector.get<string>(HACL_KEY, context.getHandler());
    if (!permiso) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const tenantId = (req.headers['x-tenant-id'] as string)?.trim() || 'default';
    const user = req.user;

    try {
      await this.haclService.checkPermission(tenantId, user, permiso);
      return true;
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      throw new ForbiddenException('No tienes permisos suficientes.');
    }
  }
}
