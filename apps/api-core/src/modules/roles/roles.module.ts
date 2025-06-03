// apps/api-core/src/modules/roles/roles.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role, RoleSchema } from './schemas/role.schema';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    // Registramos el esquema Role con Mongoose
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    // Para validar permisos, inyectamos PermissionsModule
    forwardRef(() => PermissionsModule),
  ],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}
