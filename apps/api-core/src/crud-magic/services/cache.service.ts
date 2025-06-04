// crud-magic/src/services/cache-plugin.service.ts

import { Injectable } from '@nestjs/common';

/**
 * CachePluginService
 *
 * - get(cacheKey: string): Promise<any>
 * - set(cacheKey: string, value: any, ttl: number): Promise<void>
 * - del(cacheKeyPattern: string): Promise<void>
 *
 * Sprint 4: implementar usando el CacheService global (Redis) para almacenar resultados de findAll/findOne.
 */
@Injectable()
export class CachePluginService {
  async get(cacheKey: string): Promise<any> {
    throw new Error('CachePluginService.get: not implemented');
  }

  async set(cacheKey: string, value: any, ttlSeconds: number): Promise<void> {
    throw new Error('CachePluginService.set: not implemented');
  }

  async del(cacheKeyPattern: string): Promise<void> {
    throw new Error('CachePluginService.del: not implemented');
  }
}
