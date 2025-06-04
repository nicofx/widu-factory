// apps/api-core/src/common/audit/audit.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { Reflector } from '@nestjs/core';

/**
 * Mapear rutas críticas a acciones. 
 * Ejemplo: POST /users -> 'create:user'
 *          PATCH /roles/:id -> 'update:role'
 *          DELETE /plans/:id -> 'delete:plan'
 */
const ACTION_MAP: Record<string, string> = {
  'POST:/users': 'create:user',
  'PATCH:/users': 'update:user',
  'DELETE:/users': 'delete:user',
  'POST:/roles': 'create:role',
  'PATCH:/roles': 'update:role',
  'DELETE:/roles': 'delete:role',
  'POST:/permissions': 'create:permission',
  'PATCH:/permissions': 'update:permission',
  'DELETE:/permissions': 'delete:permission',
  'POST:/plans': 'create:plan',
  'PATCH:/plans': 'update:plan',
  'DELETE:/plans': 'delete:plan',
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    const { method, originalUrl, body } = req;
    const user = (req as any).user || {}; // viene de JwtStrategy
    const tenantId: string = (req.headers['x-tenant-id'] as string) || 'default';
    const key = `${method}:${originalUrl.split('?')[0]}`; // ignorar params

    const action = ACTION_MAP[key];
    if (!action) {
      // No auditear rutas que no estén mapeadas
      return next.handle();
    }

    // Antes de ejecutar la request, guardamos datos “before”
    let beforeData: any = null;
    // Si es PATCH o DELETE, podríamos recuperar el recurso actual:
    // Ejemplo: GET user actual antes de update o delete.
    // Para simplificar, no implementamos fetch “before” genérico aquí.
    // Podrías extender esta sección si lo deseas.

    return next.handle().pipe(
      tap(async (responseData) => {
        // Después de que el controlador se ejecute, guardamos “after” y metadatos
        const resourceId = req.params['id'] || (responseData?._id?.toString()) || '';
        const metadata = {
          before: beforeData,
          after: responseData,
          body: body,
        };
        await this.auditService.log(
          tenantId,
          user.userId,
          action,
          action.split(':')[1], // 'user', 'role', etc.
          resourceId,
          metadata,
        );
      }),
    );
  }
}
