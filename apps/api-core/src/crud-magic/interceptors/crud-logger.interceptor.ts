// libs/crud-magic/src/interceptors/crud-logger.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class CrudMagicLogger implements NestInterceptor {
  private readonly log = new Logger('CrudMagic');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    if (process.env.CRUD_MAGIC_DEBUG !== 'true') return next.handle();

    const req = ctx.switchToHttp().getRequest();
    const model  = req.route.path.split('/')[1];   // crude: '/cards/:id'
    const method = req.method;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - now;
        this.log.debug(`${method} ${req.originalUrl} → ${model} (${ms} ms)`);
      })
    );
  }
}
