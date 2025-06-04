// crud-magic/src/guards/rate-limit.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Context } from '@nestjs/graphql';

/**
 * RateLimitGuard
 *
 * Aplicable a las rutas CRUD automáticas para limitar cantidad de peticiones por IP/tenant.
 * Sprint 6: implementar usando in‐memory o Redis para llevar conteo de peticiones.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1) Obtener context (req.headers['x-tenant-id'], IP, etc.)
    // 2) Contar peticiones en ventana (por Redis o Map en memoria)
    // 3) Si excede, lanzar ForbiddenException('Rate limit exceeded')
    throw new Error('RateLimitGuard.canActivate: not implemented');
  }
}
