// src/pipeline/interceptors/pipeline.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, switchMap } from 'rxjs';
import { USE_PIPELINE_KEY, SKIP_PIPELINE_KEY } from '../decorators/pipeline.decorator';
import { PipelineFactory } from '../factory/pipeline-factory.interface';
import { PipelineEngineService } from '../pipeline-engine.service';
import { RequestContext } from '../interfaces/context.interface';

@Injectable()
export class PipelineInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @Inject('PIPELINE_FACTORY') private readonly pipelineFactory: PipelineFactory,
    private readonly engine: PipelineEngineService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const skip = this.reflector.get<boolean>(SKIP_PIPELINE_KEY, handler);
    if (skip) {
      return next.handle();
    }

    const pipelineName =
      this.reflector.get<string>(USE_PIPELINE_KEY, handler) || 'default';

    const http = context.switchToHttp();
    const request = http.getRequest();
    const requestId = `REQ-${Date.now()}`;

    // Construir RequestContext nuevo:
    const requestContext: RequestContext = {
      requestId,
      body: request.body,
      headers: request.headers,
      user: request.user,
      meta: { logs: [] },
      services: {},
    };

    // Observable que ejecuta el pipeline según tenant y lo inyecta antes del controller:
    const pipeline$ = from(
      this.pipelineFactory
        .getPipeline(pipelineName, requestContext)   // <-- le pasamos el context
        .then((steps) => this.engine.executeWithSteps(requestContext, steps))
        .then(() => {
          request.pipelineContext = requestContext;  // asignamos antes de seguir
        })
    );

    return pipeline$.pipe(
      switchMap(() => next.handle())
    );
  }
}
