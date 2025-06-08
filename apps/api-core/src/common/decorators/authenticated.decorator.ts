// apps/api-core/src/common/decorators/authenticated.decorator.ts

import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { SessionGuard } from '../guards/session.guard';
import { TenantGuard } from '../guards/tenant.guard';

/**
 * Protege endpoints: requiere JWT válido, sesión activa y tenant correcto.
 */
export function Authenticated() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, SessionGuard, TenantGuard)
  );
}
