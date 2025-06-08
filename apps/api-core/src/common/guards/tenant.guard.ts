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
    req.tenantId = tenantIdHeader;                          // 👉 1) inyección
    
    const existsTenant = await this.tenantsService.findById(tenantIdHeader);
    if (!existsTenant) throw new UnauthorizedException(`Tenant "${tenantIdHeader}" no existe.`);
    
    // Si el endpoint ya pasó por JwtAuthGuard, habrá req.user; si no, lo saltamos
    if (req.user && req.user.tenantId !== tenantIdHeader) { // 👉 2) tolerancia rutas públicas
      throw new UnauthorizedException('No puedes operar en otro tenant.');
    }
    return true;
  }
}
