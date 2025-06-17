// apps/api-core/src/modules/plans/plans.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Plan } from './schemas/plan.schema';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plan.name) private readonly planModel: Model<Plan>,
    @Inject(forwardRef(() => RolesService))
    private readonly rolesService: RolesService,
  ) {}

  /**
   * Crear un nuevo plan en un tenant.
   * @param tenantId — Tenant actual.
   * @param createDto — { name, price, features?, defaultRoles? }
   */
  async create(
    tenantId: string,
    createDto: CreatePlanDto,
  ): Promise<Plan> {
    const { name, price, features = [], defaultRoles = [] } = createDto;

    // 1) Verificar duplicado (tenantId, name)
    const exist = await this.planModel.findOne({ tenantId, name }).exec();
    if (exist) {
      throw new ConflictException(`El plan "${name}" ya existe en este tenant.`);
    }

    // 2) Validar que cada roleId de defaultRoles exista en este tenant
    const validRoleIds: Types.ObjectId[] = [];
    for (const rId of defaultRoles) {
      if (!Types.ObjectId.isValid(rId)) {
        throw new BadRequestException(`ID de rol inválido: ${rId}`);
      }
      const role = await this.rolesService.findOne(tenantId, rId);
      if (!role) {
        throw new BadRequestException(`Rol con ID "${rId}" no existe en este tenant.`);
      }
      validRoleIds.push(new Types.ObjectId(rId));
    }

    // 3) Creamos el plan
    const created = new this.planModel({
      tenantId,
      name,
      price,
      features,
      defaultRoles: validRoleIds,
    });
    return await created.save();
  }

  /**
   * Listar todos los planes de este tenant.
   */
  async findAll(
    tenantId: string,
    searchTerm?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Plan[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter: any = { tenantId };
    if (searchTerm && searchTerm.trim() !== '') {
      filter.name = { $regex: searchTerm, $options: 'i' };
    }
    const [data, total] = await Promise.all([
      this.planModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.planModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  /**
   * Obtener un plan por ID, en este tenant.
   */
  async findOne(tenantId: string, id: string): Promise<Plan> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de plan inválido');
    }
    const plan = await this.planModel
      .findOne({ _id: id, tenantId })
      .exec();
    if (!plan) {
      throw new NotFoundException(`Plan con ID "${id}" no encontrado en este tenant.`);
    }
    return plan;
  }

  /**
   * Actualizar un plan: price, features, defaultRoles.
   */
  async update(
    tenantId: string,
    id: string,
    updateDto: UpdatePlanDto,
  ): Promise<Plan> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de plan inválido');
    }
    const plan = await this.planModel
      .findOne({ _id: id, tenantId })
      .exec();
    if (!plan) {
      throw new NotFoundException(`Plan con ID "${id}" no encontrado en este tenant.`);
    }

    // Cambiar precio si viene
    if (updateDto.price !== undefined) {
      if (updateDto.price < 0) {
        throw new BadRequestException('El precio no puede ser negativo');
      }
      plan.price = updateDto.price;
    }

    // Cambiar features
    if (updateDto.features) {
      plan.features = updateDto.features;
    }

    // Cambiar defaultRoles
    if (updateDto.defaultRoles) {
      const newRoleIds: Types.ObjectId[] = [];
      for (const rId of updateDto.defaultRoles) {
        if (!Types.ObjectId.isValid(rId)) {
          throw new BadRequestException(`ID de rol inválido: ${rId}`);
        }
        const role = await this.rolesService.findOne(tenantId, rId);
        if (!role) {
          throw new BadRequestException(`Rol con ID "${rId}" no existe en este tenant.`);
        }
        newRoleIds.push(new Types.ObjectId(rId));
      }
      plan.defaultRoles = newRoleIds;
    }

    return await plan.save();
  }

  /**
   * Eliminar un plan (hard delete). En Sprint 4 validar usuarios antes.
   */
  async remove(tenantId: string, id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de plan inválido');
    }
    const plan = await this.planModel
      .findOne({ _id: id, tenantId })
      .exec();
    if (!plan) {
      throw new NotFoundException(`Plan con ID "${id}" no encontrado en este tenant.`);
    }

    await this.planModel.deleteOne({ _id: id, tenantId }).exec();
  }

  async findByName(tenantId: string, name: string): Promise<Plan | null> {
  return this.planModel.findOne({ tenantId, name }).exec();
}

}
