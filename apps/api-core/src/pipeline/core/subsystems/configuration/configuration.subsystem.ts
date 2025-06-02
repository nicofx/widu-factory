// src/pipeline/core/subsystems/configuration/configuration.subsystem.ts
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { RequestContext } from '../../../interfaces/context.interface';
import { PipelineConfig, PhaseConfig, ElementConfig } from '../../dto/pipeline-config.dto';
import { InvalidPipelineConfigError } from '../../errors/invalid-pipeline-config.error';

@Injectable()
export class ConfigurationSubsystem {
  /* ─── cache in-memory ─── */
  private cache = new Map<string, { config: PipelineConfig; loadedAt: number }>();
  private readonly CACHE_TTL_MS = 60_000;                    // 60 s
  private readonly logger = new Logger(ConfigurationSubsystem.name);

  /* ─── config global (default) ─── */
  private globalConfig: PipelineConfig;

  constructor() {
    this.globalConfig = this.loadAndValidate('default');
    this.logger.log('[CONFIG] ✅ default.json cargado y validado');
  }

  /* ───────────────────────────────────────────────────────── */
  /** Devuelve config combinada (default + tenant) con cache */
  public getConfig(context: RequestContext): PipelineConfig {
    if (context.meta.__config) return context.meta.__config;

    const tenant = (context.headers?.['x-tenant'] || 'default').toString();
    const now = Date.now();

    /* leer desde cache o disco si expiró */
    if (
      !this.cache.has(tenant) ||
      now - this.cache.get(tenant)!.loadedAt > this.CACHE_TTL_MS
    ) {
      const tenantCfg = this.loadAndValidate(tenant);
      const combined: PipelineConfig = {
        ...this.globalConfig,
        ...tenantCfg,
      };
      this.cache.set(tenant, { config: combined, loadedAt: now });
      this.logger.log(`[CONFIG] 🧩 (${tenant}) merge ok`);
    }

    context.meta.__config = this.cache.get(tenant)!.config;
    return context.meta.__config;
  }

  /** Acceso rápido a un valor global */
  public getValue(key: string, fallback: any = null): any {
    return (this.globalConfig as any)[key] ?? fallback;
  }

  /* ────────── helpers privados ────────── */
  private loadAndValidate(name: string): PipelineConfig {
    const cfg = this.loadConfigFile(name);
    try {
      return this.validateConfigObject(cfg);
    } catch (err: any) {
      if (err instanceof InvalidPipelineConfigError) throw err;
      this.logger.error(`[CONFIG] ❌ ${name}.json inválido: ${err.message}`);
      throw err;
    }
  }

private loadConfigFile(name: string): any {
  const searchRoots = [
    process.env.CONFIG_DIR,                  // 1) override explícito
    path.resolve(process.cwd(), 'config'),   // 2) carpeta config en raíz
    path.resolve(__dirname, '../../../../config'), // 3) fallback relativo (dev)
  ].filter(Boolean);

  for (const root of searchRoots) {
    const filePath = path.join(root!, `${name}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        this.logger.log(`[CONFIG] ✅ Cargado ${filePath}`);
        return JSON.parse(raw);
      } catch (e) {
        this.logger.error(`[CONFIG] ❌ Error parseando ${filePath}: ${e}`);
        return {};
      }
    }
  }

  this.logger.warn(`[CONFIG] ⚠️  ${name}.json no encontrado en ${searchRoots.join(', ')}`);
  return {};
}

  /** Validación mínima de esquema (v1.0) */
  private validateConfigObject(obj: any): PipelineConfig {
    if (!obj || typeof obj !== 'object') {
      throw new InvalidPipelineConfigError('El JSON no es un objeto');
    }

    /* permitir esquema viejo (pipelines…) sin phases */
    if (!Array.isArray(obj.phases)) {
      // legacy: agregamos por compatibilidad
      obj.phases = ['pre', 'processing', 'post'];
    }

    /* Validar cada fase declarada */
    for (const phase of obj.phases) {
      const phaseCfg: PhaseConfig | undefined = obj[phase];
      if (phaseCfg && typeof phaseCfg !== 'object') {
        throw new InvalidPipelineConfigError(
          `La fase "${phase}" debe ser un objeto con steps/hooks`,
        );
      }
      ['hooksBefore', 'steps', 'hooksAfter'].forEach((key) => {
        const arr = (phaseCfg as any)?.[key];
        if (arr && !Array.isArray(arr)) {
          throw new InvalidPipelineConfigError(
            `En fase "${phase}", "${key}" debe ser array`,
          );
        }
        if (Array.isArray(arr)) {
          arr.forEach((el: any, idx: number) => {
            if (typeof el === 'string') return;
            if (
              typeof el === 'object' &&
              typeof (el as ElementConfig).name === 'string'
            )
              return;
            throw new InvalidPipelineConfigError(
              `Elemento inválido en ${phase}.${key}[${idx}]`,
            );
          });
        }
      });
    }

    return obj as PipelineConfig;
  }
}
