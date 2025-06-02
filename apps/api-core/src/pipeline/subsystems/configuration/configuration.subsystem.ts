import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { RequestContext } from '../../interfaces/context.interface';

@Injectable()
export class ConfigurationSubsystem {
  private globalConfig: any;
  private readonly logger = new Logger(ConfigurationSubsystem.name);

  constructor() {
    // ✅ Carga config global al iniciar (default.json)
    this.globalConfig = this.loadConfigFile('default');
    this.logger.log(`[CONFIG] ✅ Configuración global cargada: ${JSON.stringify(this.globalConfig)}`);
  }

  /**
   * Carga un archivo de configuración (e.g. default.json, tenant.json)
   */
  private loadConfigFile(name: string): any {
    // 📁 Calcula path absoluto al directorio de configuración
    const configDir = path.resolve(__dirname, '../../../../config');
    const configPath = path.join(configDir, `${name}.json`);

    this.logger.log(`[CONFIG] 🔍 Intentando cargar configuración: ${configPath}`);

    if (fs.existsSync(configPath)) {
      try {
        const fileContent = fs.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.logger.log(`[CONFIG] ✅ Archivo cargado correctamente: ${name}.json`);
        return parsed;
      } catch (err: any) {
        this.logger.error(`[CONFIG] ❌ Error al parsear el archivo: ${configPath}`, err.stack);
        return {};
      }
    } else {
      this.logger.warn(`[CONFIG] ⚠️ Archivo no encontrado: ${configPath}`);
      return {};
    }
  }

  /**
   * Devuelve la configuración combinada (default + tenant)
   */
  public getConfig(context: RequestContext): any {
    if (!context.meta.__config) {
      const tenant = context.headers?.['x-tenant'] || 'default';
      const tenantConfig = this.loadConfigFile(tenant);
      const combined = {
        ...this.globalConfig,
        ...tenantConfig,
      };
      this.logger.log(`[CONFIG] 🧩 Configuración combinada (${tenant}): ${JSON.stringify(combined)}`);
      context.meta.__config = combined;
    }
    return context.meta.__config;
  }

  /**
   * Devuelve un valor del config global
   */
  public getValue(key: string, fallback: any = null): any {
    return this.globalConfig[key] ?? fallback;
  }
}
