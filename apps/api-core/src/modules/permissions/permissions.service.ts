// apps/api-core/src/modules/permissions/permissions.service.ts

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

import { Permission } from './schemas/permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

// Inyectamos RolesService para sincronizar borrado/renombrado
import { RolesService } from '../roles/roles.service';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private readonly permissionModel: Model<Permission>,
    @Inject(forwardRef(() => RolesService))
    private readonly rolesService: RolesService,
  ) {}

  /**
   * Crear un permiso en un tenant dado.
   */
  async create(
    tenantId: string,
    createDto: CreatePermissionDto,
  ): Promise<Permission> {
    const { name, description } = createDto;

    // 1) Verificar duplicado en este tenant
    const exist = await this.permissionModel
      .findOne({ tenantId, name })
      .exec();
    if (exist) {
      throw new ConflictException(`El permiso "${name}" ya existe en este tenant.`);
    }

    const created = new this.permissionModel({ tenantId, name, description });
    return await created.save();
  }

  /**
   * Listar permisos de este tenant.
   */
  async findAll(
    tenantId: string,
    searchTerm?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Permission[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter: any = { tenantId };
    if (searchTerm && searchTerm.trim() !== '') {
      filter.name = { $regex: searchTerm, $options: 'i' };
    }
    const [data, total] = await Promise.all([
      this.permissionModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.permissionModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  /**
   * Obtener un permiso por ID en este tenant.
   */
  async findOne(tenantId: string, id: string): Promise<Permission> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de permiso inválido');
    }
    const perm = await this.permissionModel
      .findOne({ _id: id, tenantId })
      .exec();
    if (!perm) {
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado en este tenant.`);
    }
    return perm;
  }

  /**
   * Actualizar un permiso (o renombrarlo).
   * Si renombramos, verificamos duplicado en este tenant.
   * Luego, llamamos a RolesService.replacePermissionInRoles para sincronizar,
   * aunque en este momento es “no-op” (solo placeholder).
   */
  async update(
    tenantId: string,
    id: string,
    updateDto: UpdatePermissionDto,
  ): Promise<Permission> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de permiso inválido');
    }
    const perm = await this.permissionModel
      .findOne({ _id: id, tenantId })
      .exec();
    if (!perm) {
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado en este tenant.`);
    }

    // Si renombramos
    if (updateDto.name && updateDto.name !== perm.name) {
      const exist = await this.permissionModel
        .findOne({ tenantId, name: updateDto.name })
        .exec();
      if (exist) {
        throw new ConflictException(`El permiso "${updateDto.name}" ya existe en este tenant.`);
      }
      // 🔄 Sincronizar con RolesService (en este momento no hace nada)
      await this.rolesService.replacePermissionInRoles(tenantId, id, id);
      perm.name = updateDto.name;
    }

    if (updateDto.description !== undefined) {
      perm.description = updateDto.description;
    }

    return await perm.save();
  }

  /**
   * Eliminar un permiso (hard delete).
   * Antes de borrar, le pedimos a RolesService que quite ese permiso de todos los roles.
   */
  async remove(tenantId: string, id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de permiso inválido');
    }
    const perm = await this.permissionModel
      .findOne({ _id: id, tenantId })
      .exec();
    if (!perm) {
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado en este tenant.`);
    }

    // Primero quitamos referencias en roles
    await this.rolesService.removePermissionFromAllRoles(tenantId, id);
    // Luego borramos físicamente
    await this.permissionModel.deleteOne({ _id: id, tenantId }).exec();
  }

    /**
   * Buscar múltiples permisos por su ObjectId (array). Retorna array de Permission.
   */
  async findManyByIds(
    tenantId: string,
    ids: Types.ObjectId[],
  ): Promise<Permission[]> {
    return this.permissionModel
      .find({ tenantId, _id: { $in: ids } })
      .exec();
  }
}
