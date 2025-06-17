// apps/api-core/src/modules/roles/roles.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Role, RoleSchema } from './schemas/role.schema';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { CacheModule } from '../../common/cache/cache.module';

// Importamos TenantsModule para poder inyectar TenantsService en TenantGuard
import { TenantsModule } from '../tenants/tenants.module';

// Si tu TenantGuard está en otro archivo, asegúrate de importarlo aquí:
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),

    // Para validar permisos, inyectamos PermissionsModule con forwardRef
    forwardRef(() => PermissionsModule),

    // CacheModule para invalidar cache de permisos
    CacheModule,

    // ***** Esto es lo que faltaba: importar TenantsModule *****
    TenantsModule,
  ],
  providers: [
    RolesService,
    // Si usas TenantGuard a nivel de controlador, también puedes proveerlo aquí:
    TenantGuard,
  ],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}
