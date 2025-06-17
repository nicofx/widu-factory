import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { BasePipelineError } from '../../pipeline/core/errors/base-error';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx   = host.switchToHttp();
    const res   = ctx.getResponse();
    const req   = ctx.getRequest();

    /* ── Mapear tipo de error → status ───────────────────── */
    let status = 500;
    let body: any = { success: false };

    if (exception instanceof BasePipelineError) {
      status = exception.status;
      body   = {
        ...body,
        error: exception.constructor.name,
        message: exception.message,
        details: (exception as any).details,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      body   = { ...body, message: exception.message };
    } else {
      body.message = 'Internal server error';
      console.error('[UNHANDLED]', exception);
    }

    /* ── Formato de respuesta consistente ─────────────────── */
    res.status(status).json({
      ...body,
      timestamp: new Date().toISOString(),
      path: req.url,
      requestId: req?.pipelineContext?.requestId,
    });
  }
}
