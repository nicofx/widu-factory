// crud-magic/src/services/hacl.service.ts

import { Injectable, ForbiddenException } from '@nestjs/common';
import { PermissionsService } from '../../modules/permissions/permissions.service';
import { RolesService } from '../../modules/roles/roles.service';
import { CacheService } from '../../common/cache/cache.service';

/**
 * HaclService
 *
 * Lógica mínima para:
 *  - Obtener los roles que tiene el usuario
 *  - Traducir roles → permisos usando RolesService.getPermissionsForRoles()
 *  - Verificar que el permiso "<entidad>.<acción>" esté en esa lista
 */
@Injectable()
export class HaclService {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly rolesService: RolesService,
    private readonly cacheService: CacheService, // opcional para cachear permisos por usuario
  ) {}

  /**
   * Verifica que el usuario (payload JWT) tenga el permiso "permiso"
   * para operar en el tenantId dado.
   *
   * permiso debe venir en formato "<entidad>.<acción>" (p. ej. "users.read").
   * user.roles es un array de roleIds (string).
   * Llamamos a RolesService.getPermissionsForRoles que retorna ["users.read", ...].
   */
  async checkPermission(
    tenantId: string,
    user: any,
    permiso: string,
  ): Promise<void> {
    if (!user || !Array.isArray(user.roles)) {
      throw new ForbiddenException('Usuario no autenticado o sin roles.');
    }

    const roleIds: string[] = user.roles.map((r: any) => r.toString());

    // Chequeo de cache: clave = `${tenantId}:${userId}:${sortedRoleIds}`
    const cacheKey = `hacl:${tenantId}:${user.userId}:${roleIds.sort().join(',')}`;

    let permisosUsuario: string[] | null = await this.cacheService.getJSON<string[]>(cacheKey);
    if (permisosUsuario === null) {
      // No está en cache → lo obtenemos desde RolesService
      permisosUsuario = await this.rolesService.getPermissionsForRoles(tenantId, roleIds);
      // Guardamos en Redis por 60 segundos
      await this.cacheService.setJSON(cacheKey, permisosUsuario, 60);
    }

    // Verificamos que el permiso solicitado esté en la lista
    if (!permisosUsuario.includes(permiso)) {
      throw new ForbiddenException(`No tienes permiso: ${permiso}`);
    }
    // Si llegamos acá, el usuario tiene el permiso requerido → devolvemos void
  }
}
