// apps/api-core/src/modules/roles/roles.service.ts

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

import { Role } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

// Inyectamos PermissionsService para validar IDs de permisos
import { PermissionsService } from '../permissions/permissions.service';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,

    // forwardRef para resolver posible dependencia circular con PermissionsModule
    @Inject(forwardRef(() => PermissionsService))
    private readonly permissionsService: PermissionsService,

    private readonly cacheService: CacheService,
  ) {}

  /**
   * Busca un rol por nombre dentro de un tenant (se usa en Seeder y validaciones).
   */
  async findByName(tenantId: string, name: string): Promise<Role | null> {
    return this.roleModel.findOne({ tenantId, name, deleted: false }).exec();
  }

  /**
   * Crear un nuevo rol en un tenant dado.
   */
  async create(
    tenantId: string,
    createRoleDto: CreateRoleDto,
  ): Promise<Role> {
    const { name, permissions } = createRoleDto;

    // 1) Chequear duplicado por (tenantId, name)
    const exist = await this.roleModel.findOne({ tenantId, name }).exec();
    if (exist) {
      throw new ConflictException(`El rol "${name}" ya existe en este tenant.`);
    }

    // 2) Validar que cada permiso exista en este tenant
    for (const permId of permissions) {
      if (!Types.ObjectId.isValid(permId)) {
        throw new BadRequestException(`ID de permiso inválido: ${permId}`);
      }
      const permExists = await this.permissionsService.findOne(tenantId, permId);
      if (!permExists) {
        throw new BadRequestException(
          `Permiso con ID "${permId}" no existe en este tenant.`,
        );
      }
    }

    // 3) Creamos el rol
    const created = new this.roleModel({
      tenantId,
      name,
      permissions: permissions.map((id) => new Types.ObjectId(id)),
      deleted: false,
    });

    const saved = await created.save();
    // 4) Invalidar cache de permisos para este tenant
    await this.cacheService.del(`permissions:${tenantId}:*`);
    return saved;
  }

  /**
   * Listar roles (no borrados) de un tenant.
   */
  async findAll(
    tenantId: string,
    searchTerm?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Role[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter: any = { tenantId, deleted: false };
    if (searchTerm && searchTerm.trim() !== '') {
      filter.name = { $regex: searchTerm, $options: 'i' };
    }
    const [data, total] = await Promise.all([
      this.roleModel.find(filter).skip(skip).limit(limit).exec(),
      this.roleModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  /**
   * Obtener un solo rol por ID, validando tenant y que no esté borrado.
   */
  async findOne(tenantId: string, id: string): Promise<Role> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de rol inválido');
    }
    const role = await this.roleModel
      .findOne({ _id: id, tenantId, deleted: false })
      .exec();
    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado en este tenant.`);
    }
    return role;
  }

  /**
   * Actualizar un rol dentro de un tenant.
   */
  async update(
    tenantId: string,
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de rol inválido');
    }
    const role = await this.roleModel
      .findOne({ _id: id, tenantId, deleted: false })
      .exec();
    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado en este tenant.`);
    }

    // Si renombramos
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const exist = await this.roleModel
        .findOne({ tenantId, name: updateRoleDto.name })
        .exec();
      if (exist) {
        throw new ConflictException(`El rol "${updateRoleDto.name}" ya existe en este tenant.`);
      }
      role.name = updateRoleDto.name;
    }

    // Si cambiamos permisos
    if (updateRoleDto.permissions) {
      for (const permId of updateRoleDto.permissions) {
        if (!Types.ObjectId.isValid(permId)) {
          throw new BadRequestException(`ID de permiso inválido: ${permId}`);
        }
        const permExists = await this.permissionsService.findOne(tenantId, permId);
        if (!permExists) {
          throw new BadRequestException(`Permiso con ID "${permId}" no existe en este tenant.`);
        }
      }
      role.permissions = updateRoleDto.permissions.map((id) => new Types.ObjectId(id));
    }

    // Invalidar cache luego de cambios
    await this.cacheService.del(`permissions:${tenantId}:*`);
    return await role.save();
  }

  /**
   * “Soft-delete” de rol: marcamos deleted = true.
   */
  async remove(tenantId: string, id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de rol inválido');
    }
    const role = await this.roleModel
      .findOne({ _id: id, tenantId, deleted: false })
      .exec();
    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado en este tenant.`);
    }

    role.deleted = true;
    await role.save();
    // Invalidar cache luego de borrado
    await this.cacheService.del(`permissions:${tenantId}:*`);
  }

  /**
   * Eliminación “hard” de un permiso de todos los roles de este tenant.
   * (Se invoca cuando se borra un permiso en PermissionsService.)
   */
  async removePermissionFromAllRoles(
    tenantId: string,
    permissionId: string,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(permissionId)) {
      throw new BadRequestException('ID de permiso inválido');
    }
    await this.roleModel.updateMany(
      { tenantId, permissions: new Types.ObjectId(permissionId) },
      { $pull: { permissions: new Types.ObjectId(permissionId) } },
    );
  }

  /**
   * Reemplazar permiso en los roles:
   * - Busca todos los roles de este tenant que contengan oldPermissionId en su array `permissions`.
   * - En cada rol, reemplaza oldPermissionId por newPermissionId (con el mismo orden en el array).
   */
  async replacePermissionInRoles(
    tenantId: string,
    oldPermissionId: string,
    newPermissionId: string,
  ): Promise<void> {
    if (
      !Types.ObjectId.isValid(oldPermissionId) ||
      !Types.ObjectId.isValid(newPermissionId)
    ) {
      throw new BadRequestException('ID de permiso inválido');
    }

    const oldId = new Types.ObjectId(oldPermissionId);
    const newId = new Types.ObjectId(newPermissionId);

    // Actualizamos en una sola operación usando un pipeline de MongoDB para mapear el array
    await this.roleModel.updateMany(
      { tenantId, permissions: oldId },
      [
        {
          $set: {
            permissions: {
              $map: {
                input: '$permissions',
                as: 'p',
                in: {
                  $cond: [{ $eq: ['$$p', oldId] }, newId, '$$p'],
                },
              },
            },
          },
        },
      ],
    );
    // Nota: Si un rol ya contenía newPermissionId junto con oldPermissionId,
    // aparecerá duplicado en el arreglo. Si deseas eliminar duplicados, podrías
    // usar una segunda etapa en el pipeline para aplicar $setUnion. Por simplicidad,
    // dejamos la lógica básica.
  }

  /**
   * Dado un array de roleIds, devuelve un array de nombres de permiso
   * (con cache en Redis). No se toca esta parte.
   */
  async getPermissionsForRoles(
    tenantId: string,
    roleIds: string[],
  ): Promise<string[]> {
    const sortedIds = [...roleIds].sort().join(',');
    const cacheKey = `permissions:${tenantId}:${sortedIds}`;

    const cached = await this.cacheService.getJSON<string[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const objectIds = roleIds.map((r) => new Types.ObjectId(r));
    const roles = await this.roleModel
      .find({ tenantId, _id: { $in: objectIds }, deleted: false })
      .exec();

    const permIds = roles.reduce<Types.ObjectId[]>((acc, role) => {
      role.permissions?.forEach((p) => acc.push(p));
      return acc;
    }, []);

    if (permIds.length === 0) {
      await this.cacheService.setJSON(cacheKey, [], 3600);
      return [];
    }

    const uniqueIds = Array.from(new Set(permIds.map((p) => p.toString()))).map(
      (id) => new Types.ObjectId(id),
    );
    const permissions = await this.permissionsService.findManyByIds(
      tenantId,
      uniqueIds,
    );
    const permissionNames = permissions.map((perm) => perm.name);

    await this.cacheService.setJSON(cacheKey, permissionNames, 3600);
    return permissionNames;
  }
}
