// apps/api-core/src/common/cache/cache.service.ts

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient!: Redis;

  onModuleInit() {
    // Crear el cliente de Redis al iniciar el módulo.
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: +(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Conectado a Redis');
    });
    this.redisClient.on('error', (err) => {
      this.logger.error('Error en cliente Redis', err);
    });
  }

  async onModuleDestroy() {
    // Cerrar la conexión cuando la app se detenga.
    await this.redisClient.quit();
  }

  /**
   * Obtener un valor JSON almacenado en Redis.
   * - Si la clave no existe o no es JSON válido, devuelve null.
   */
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      this.logger.error(`Error al leer o parsear JSON de cache en key=${key}`, err);
      return null;
    }
  }

  /**
   * Guardar un objeto como JSON en Redis, con TTL (en segundos).
   */
  async setJSON(key: string, value: any, ttlSeconds: number): Promise<void> {
    try {
      const stringified = JSON.stringify(value);
      await this.redisClient.set(key, stringified, 'EX', ttlSeconds);
    } catch (err) {
      this.logger.error(`Error al guardar JSON en cache key=${key}`, err);
    }
  }

  /**
   * Eliminar una clave o, si incluyes '*', todas las que coincidan.
   */
  async del(keyPattern: string): Promise<void> {
    try {
      if (keyPattern.includes('*')) {
        const keys = await this.redisClient.keys(keyPattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } else {
        await this.redisClient.del(keyPattern);
      }
    } catch (err) {
      this.logger.error(`Error al eliminar clave(s) de cache patrón=${keyPattern}`, err);
    }
  }
}
