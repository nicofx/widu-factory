// crud-magic/src/services/hacl.service.ts

import { Injectable, ForbiddenException } from '@nestjs/common';
import { RolesService } from '../../modules/roles/roles.service';
import { CacheService } from '../../common/cache/cache.service';

/**
 * HaclService
 *
 * - Usa directamente user.roles (array de roleIds como string) del JWT.
 * - Llama a RolesService.getPermissionsForRoles(tenantId, roleIds) para obtener los permisos.
 * - Cachea el array de permisos 60 segundos con CacheService.getJSON/setJSON.
 * - Si falta el permiso, lanza ForbiddenException.
 */
@Injectable()
export class HaclService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Verifica que el usuario tenga el permisoRequerido en el tenantId dado.
   *
   * Pasos:
   * 1) Asegura que user.roles exista y sea un array.
   * 2) Construye cacheKey = `hacl:${tenantId}:${userId}:${sortedRoles}`.
   * 3) Intenta leer permisosUsuario = cacheService.getJSON(cacheKey).
   * 4) Si no hay cache → permisosUsuario = rolesService.getPermissionsForRoles(tenantId, roleIds).
   *    Luego cacheService.setJSON(cacheKey, permisosUsuario, 60).
   * 5) Si permisoRequerido no está en permisosUsuario → ForbiddenException.
   */
  async checkPermission(
    tenantId: string,
    user: any,
    permisoRequerido: string,
  ): Promise<void> {
    // 1) Verificar que user.roles sea un array de strings
    if (!user || !Array.isArray(user.roles)) {
      throw new ForbiddenException('Usuario no autenticado o sin roles.');
    }

    // Determinar userId (adapta si en tu JWT usas otro campo)
    const userId = (user.userId as string) || (user.id as string);
    if (!userId) {
      throw new ForbiddenException('No se encontró userId en el payload.');
    }

    // 2) Construir cacheKey usando tenantId, userId y roles ordenados
    const rolesIds: string[] = (user.roles as string[]).map((r) => r.toString());
    const sortedRoles = [...rolesIds].sort().join(',');
    const cacheKey = `hacl:${tenantId}:${userId}:${sortedRoles}`;

    // 3) Intentar leer permisosUsuario de cache
    let permisosUsuario: string[] | null = null;
    try {
      permisosUsuario = await this.cacheService.getJSON<string[]>(cacheKey);
    } catch {
      permisosUsuario = null;
    }

    // 4) Si no había cache, obtener de RolesService y cachear
    if (!permisosUsuario) {
      // Llamada a tu RolesService: firma tal como la programaste:
      // async getPermissionsForRoles(tenantId: string, roleIds: string[]): Promise<string[]>
      permisosUsuario = await this.rolesService.getPermissionsForRoles(
        tenantId,
        rolesIds,
      );
      // Guardar en cache 60 segundos
      await this.cacheService.setJSON(cacheKey, permisosUsuario, 60);
    }

    // 5) Verificar que permisoRequerido esté en la lista
    if (!permisosUsuario.includes(permisoRequerido)) {
      throw new ForbiddenException(`No tienes permiso: ${permisoRequerido}`);
    }

    // Si llegó hasta aquí, el permiso existe y dejamos continuar
    return;
  }
}
