// crud-magic/src/services/hooks.service.ts

import { Injectable } from '@nestjs/common';

/**
 * HooksService
 *
 * Registro y ejecución de “hooks” (servicios que implementen cierta interfaz).
 * Permite a terceros registrar funciones a ejecutar antes/después de cada operación CRUD.
 *
 * Sprint 7: exponer registerHook(entityName, hookInstance) y ejecutar en BaseCrudService.
 */
@Injectable()
export class HooksService {
  /**
   * Registra un hook para una entidad y evento específico
   */
  registerHook(
    entityName: string,
    event: 'beforeCreate' | 'afterCreate' | 'beforeUpdate' | 'afterUpdate' | 'beforeDelete' | 'afterDelete',
    hookName: string,
  ) {
    throw new Error('HooksService.registerHook: not implemented');
  }

  /**
   * Ejecuta todos los hooks registrados para un evento determinado,
   * pasándole los parámetros necesarios (tenantId, user, payload).
   */
  async executeHooks(
    entityName: string,
    event: string,
    context: any,
  ): Promise<void> {
    throw new Error('HooksService.executeHooks: not implemented');
  }
}
