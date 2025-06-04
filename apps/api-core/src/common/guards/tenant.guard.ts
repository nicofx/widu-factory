// apps/api-core/src/common/guards/tenant.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TenantsService } from '../../modules/tenants/tenants.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenantsService: TenantsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const tenantIdHeader = (req.headers['x-tenant-id'] as string)?.trim() || 'default';
    const user = req.user; // Inyectado por JwtStrategy

    // 1) Verificar que el tenant “exista” (stub devuelve true siempre)
    const existsTenant = await this.tenantsService.findById(tenantIdHeader);
    if (!existsTenant) {
      throw new UnauthorizedException(`Tenant "${tenantIdHeader}" no existe.`);
    }

    // 2) Verificar que el usuario pertenezca a ese tenant (payload JWT)
    if (user.tenantId !== tenantIdHeader) {
      throw new UnauthorizedException('No puedes operar en otro tenant.');
    }

    return true;
  }
}
