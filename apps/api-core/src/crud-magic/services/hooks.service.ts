// src/crud-magic/services/hooks.service.ts

import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { CrudMagicOptions } from '../interfaces/crud-magic-options.interface';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class HooksService implements OnModuleInit {
  private readonly logger = new Logger(HooksService.name);

  // Mapa: { [entity: string]: { [event: string]: string[] } }
  private hooksMap: Record<string, Record<string, string[]>> = {};

  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject('CRUD_MAGIC_OPTIONS')
    private readonly options: CrudMagicOptions,
  ) {}

  onModuleInit() {
    this.loadGlobalHooks();
  }

  private loadGlobalHooks() {
    // Tomamos la parte "hooks" de tus opciones; si no existe, usamos {} vacío
    const globalHooks = this.options.hooks || {};

    // Aquí asignamos cada evento (o [] si no está presente) a un “slot” global (*) 
    this.hooksMap['*'] = {
      beforeCreate:     globalHooks.beforeCreate       || [],
      afterCreate:      globalHooks.afterCreate        || [],
      beforeUpdate:     globalHooks.beforeUpdate       || [],
      afterUpdate:      globalHooks.afterUpdate        || [],
      beforeDelete:     globalHooks.beforeDelete       || [],
      afterDelete:      globalHooks.afterDelete        || [],
      beforeBulkCreate: globalHooks.beforeBulkCreate   || [],
      afterBulkCreate:  globalHooks.afterBulkCreate    || [],
      beforeBulkUpdate: globalHooks.beforeBulkUpdate   || [],
      afterBulkUpdate:  globalHooks.afterBulkUpdate    || [],
    };
  }

  /**
   * Ejecuta los hooks configurados para `entityName` y `eventName`.
   * Primero ejecuta los específicos de `entityName` (si existieran), 
   * luego los globales (`hooksMap['*'][eventName]`).
   */
  async executeHooks(entityName: string, eventName: string, payload: any) {
    // Hooks específicos de entidad (en este sprint no definimos ninguno, pero queda preparado)
    const specificHooks: string[] = (this.hooksMap[entityName] || {})[eventName] || [];
    for (const hookName of specificHooks) {
      await this.invokeHook(hookName, payload);
    }

    // Hooks globales
    const globalHooks: string[] = (this.hooksMap['*'] || {})[eventName] || [];
    for (const hookName of globalHooks) {
      await this.invokeHook(hookName, payload);
    }
  }

  /**
   * Busca en Nest un provider con token `hookName` y, si tiene método run(), lo invoca.
   * Si no existe el provider o no tiene run(), lanza un warning.
   */
  private async invokeHook(hookName: string, payload: any) {
    let instance: any;
    try {
      instance = this.moduleRef.get(hookName, { strict: false });
    } catch {
      this.logger.warn(`HooksService: provider "${hookName}" no encontrado`);
      return;
    }
    if (instance && typeof instance.run === 'function') {
      try {
        await instance.run(payload);
      } catch (err: any) {
        this.logger.error(`Error en hook "${hookName}": ${err.message}`);
      }
    } else {
      this.logger.warn(`HooksService: "${hookName}" no expone método run()`);
    }
  }
}
