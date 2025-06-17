import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { CacheService } from '../../common/cache/cache.service';

/**
 * RateLimitGuard
 *
 * Lógica para limitar número de peticiones por tenant+IP.
 * Lancará ForbiddenException('Rate limit exceeded') cuando se supere el límite.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly cacheService: CacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const tenantId: string = (req.headers['x-tenant-id'] as string)?.trim() || 'default';
    const identifier: string = req.ip ?? 'unknown'; // Podrías usar req.user.id si estuviera disponible

    const cacheKey = `rate:${tenantId}:${identifier}`;
    // Usamos getJSON y setJSON tal como firma en el dump
    const count = (await this.cacheService.getJSON<number>(cacheKey)) || 0;

    // Tomamos valores por defecto de rateLimit (no inyectados en Sprint 1)
    const windowSec = 60;   // segundos
    const maxRequests = 10; // máximo peticiones

    if (count >= maxRequests) {
      // Lanzamos ForbiddenException en lugar de TooManyRequestsException
      throw new ForbiddenException('Rate limit exceeded');
    }

    // Incrementamos contador y guardamos con TTL
    await this.cacheService.setJSON(cacheKey, count + 1, windowSec);
    return true;
  }
}
