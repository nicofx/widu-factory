// apps/api-core/src/common/seeder/seeder.module.ts

import { Global, Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { TenantsModule } from '../../modules/tenants/tenants.module';
import { RolesModule } from '../../modules/roles/roles.module';
import { PlansModule } from '../../modules/plans/plans.module';

@Global()
@Module({
  imports: [TenantsModule, RolesModule, PlansModule],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
