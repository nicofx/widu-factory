// crud-magic/src/services/cache-plugin.service.ts

import { Injectable } from '@nestjs/common';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class CachePluginService {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Intenta leer la clave `cacheKey` desde Redis y parsearla como JSON.
   * Si no existe o hay error, devuelve null.
   */
  async get<T>(cacheKey: string): Promise<T | null> {
    return await this.cacheService.getJSON<T>(cacheKey);
  }

  /**
   * Guarda `value` serializado en JSON bajo la clave `cacheKey` con TTL en segundos.
   */
  async set(cacheKey: string, value: any, ttlSeconds: number): Promise<void> {
    await this.cacheService.setJSON(cacheKey, value, ttlSeconds);
  }

  /**
   * Elimina todas las claves que coincidan con `cacheKeyPattern`.
   * Si viene con '*', elimina múltiples; si no, elimina la clave exacta.
   */
  async del(cacheKeyPattern: string): Promise<void> {
    await this.cacheService.del(cacheKeyPattern);
  }
}
