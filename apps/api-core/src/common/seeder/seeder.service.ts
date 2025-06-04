// apps/api-core/src/common/seeder/seeder.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { TenantsService } from '../../modules/tenants/tenants.service';
import { RolesService } from '../../modules/roles/roles.service';
import { PlansService } from '../../modules/plans/plans.service';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);
  
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly rolesService: RolesService,
    private readonly plansService: PlansService,
  ) {}
  
  /**
  * Verifica y crea (si es necesario) los registros por defecto:
  * - Tenant “default”
  * - Plan “free”
  * - Rol “user” (sin descripción ni asignación de plan)
  */
  async seed() {
    // 1) Tenant por defecto
    const defaultTenantId = 'default';
    const tenantExists = await this.tenantsService.findById(defaultTenantId);
    if (!tenantExists) {
      try {
        // Ahora pasamos { tenantId, name }
        await this.tenantsService.create({
          tenantId: defaultTenantId,
          name: 'Tenant Default',
        });
        this.logger.log(`Tenant "${defaultTenantId}" creado`);
      } catch (err) {
        this.logger.error(`Error creando tenant "${defaultTenantId}":`, err);
      }
    } else {
      this.logger.log(`Tenant "${defaultTenantId}" ya existe`);
    }
    
    // 2) Plan “free” por defecto (usando findByName de PlansService)
    const freePlanName = 'free';
    let freePlan = await this.plansService.findByName(defaultTenantId, freePlanName);
    if (!freePlan) {
      try {
        freePlan = await this.plansService.create(defaultTenantId, {
          name: freePlanName,
          price: 0,
          features: [],
          defaultRoles: [],
        });
        this.logger.log(
          `Plan "${freePlanName}" creado para tenant "${defaultTenantId}"`,
        );
      } catch (err) {
        this.logger.error(`Error creando plan "${freePlanName}":`, err);
      }
    } else {
      this.logger.log(`Plan "${freePlanName}" ya existe`);
    }
    
    // 3) Rol “user” por defecto
    const userRoleName = 'user';
    let userRole = await this.rolesService.findByName(defaultTenantId, userRoleName);
    if (!userRole) {
      try {
        userRole = await this.rolesService.create(defaultTenantId, {
          name: userRoleName,
          permissions: [],
        });
        this.logger.log(`Rol "${userRoleName}" creado en tenant "${defaultTenantId}"`);
      } catch (err) {
        this.logger.error(`Error creando rol "${userRoleName}":`, err);
      }
    } else {
      this.logger.log(`Rol "${userRoleName}" ya existe`);
    }
    
    this.logger.log('Seed inicial completado');
  }
}
