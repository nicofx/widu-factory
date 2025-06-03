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

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    @Inject(forwardRef(() => PermissionsService))
    private readonly permissionsService: PermissionsService,
  ) {}
  
  /**
  * Crear un nuevo rol en un tenant dado.
  * @param tenantId — Tenant actual (header).
  * @param createRoleDto — { name, permissions[] }.
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
    
    // 2) Validar que cada permiso exista y pertenezca al mismo tenant
    for (const permId of permissions) {
      if (!Types.ObjectId.isValid(permId)) {
        throw new BadRequestException(`ID de permiso inválido: ${permId}`);
      }
      const permExists = await this.permissionsService.findOne(tenantId, permId);
      if (!permExists) {
        throw new BadRequestException(`Permiso con ID "${permId}" no existe en este tenant.`);
      }
    }
    
    // 3) Creamos el rol
    const created = new this.roleModel({
      tenantId,
      name,
      permissions: permissions.map(id => new Types.ObjectId(id)),
      deleted: false,
    });
    return await created.save();
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
      this.roleModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec(),
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
  * - Validar que el rol exista y no esté borrado.
  * - Si se renombra, verificar duplicado en el mismo tenant.
  * - Si cambian permisos, validar que existan en el mismo tenant.
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
      role.permissions = updateRoleDto.permissions.map(id => new Types.ObjectId(id));
    }
    
    return await role.save();
  }
  
  /**
  * “Soft-delete” de rol: marcamos deleted = true.
  * No eliminamos físicamente, para futura auditoría.
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
    
    // 🔴 Nota: en Sprint 4/5 validaremos que ningún usuario dependa de este rol,
    // antes de permitir borrarlo. Por ahora, sólo lo marcamos como deleted.
    role.deleted = true;
    await role.save();
  }
  
  /**
  * Eliminar de forma “hard” un permiso de todos los roles de este tenant.
  * - Llamado cuando se borra un permiso en esta tenant.
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
  * Reemplazar permiso en los roles (no aplica con IDs, queda como placeholder).
  * En este momento guardamos permissions por ObjectId, así que renombrar
  * un permiso no obliga a modificar nada en los roles.
  */
  async replacePermissionInRoles(
    tenantId: string,
    oldPermissionId: string,
    newPermissionId: string,
  ): Promise<void> {
    // No‐op para IDs, pero dejamos firma por si en el futuro guardamos nombres de permiso.
    return;
  }
  
  // Nuevo método para buscar muchos permisos por ID:
  // Este método iría en PermissionsService (ver más abajo).

    /**
   * Dado un array de roleIds (strings), devuelve un array de nombres
   * de permiso (string) que el usuario debería tener en base a esos roles.
   */
  async getPermissionsForRoles(
    tenantId: string,
    roleIds: string[],
  ): Promise<string[]> {
    // 1) Mapear a ObjectId
    const objectIds = roleIds.map((r) => new Types.ObjectId(r));
    // 2) Buscar roles (asegurándonos de que pertenezcan al mismo tenant y no estén borrados)
    const roles = await this.roleModel
      .find({
        tenantId,
        _id: { $in: objectIds },
        deleted: false,
      })
      .exec();
    // 3) Recopilar todos los permission ObjectIds de cada rol
    const permIds = roles.reduce<Types.ObjectId[]>((acc, role) => {
      role.permissions?.forEach((p) => acc.push(p));
      return acc;
    }, []);
    if (permIds.length === 0) {
      return [];
    }
    // 4) Eliminar duplicados de ObjectId
    const uniqueIds = Array.from(new Set(permIds.map((p) => p.toString()))).map(
      (id) => new Types.ObjectId(id),
    );
    // 5) Usar PermissionsService para obtener el nombre de cada permiso
    const permissions = await this.permissionsService.findManyByIds(
      tenantId,
      uniqueIds,
    ); // findManyByIds retorna array de Permission con campo name
    return permissions.map((perm) => perm.name);
  }

}
