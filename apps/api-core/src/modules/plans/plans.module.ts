// apps/api-core/src/modules/plans/plans.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Plan, PlanSchema } from './schemas/plan.schema';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { RolesModule } from '../roles/roles.module';

// Importamos TenantsModule para que TenantGuard (que se aplica en PlansController) encuentre TenantsService
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    // Registro del schema “Plan” en Mongoose
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    // forwardRef para romper la posible circularidad con RolesModule
    forwardRef(() => RolesModule),
    // ← Aquí se añade TenantsModule:
    TenantsModule,
  ],
  providers: [PlansService],
  controllers: [PlansController],
  exports: [PlansService],
})
export class PlansModule {}
