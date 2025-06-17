// apps/api-core/src/modules/tenants/tenants.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { TenantsService } from './tenants.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
  ],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
