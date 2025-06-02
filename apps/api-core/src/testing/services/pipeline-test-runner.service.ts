// src/testing/services/pipeline-test-runner.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { RequestPipelineProvider } from '../../pipeline/request-pipeline.provider';
import { ContextSubsystem } from '../../pipeline/subsystems/context/context.subsystem';
import { ServiceResolverSubsystem } from '../../pipeline/subsystems/service/service-resolver.subsystem';
import { StepExecutionLog, RequestContext } from '../../pipeline/interfaces/context.interface';
import { PipelineEngineService } from '../../pipeline/pipeline-engine.service';

@Injectable()
export class PipelineTestRunnerService {
  constructor(
    private readonly engine: PipelineEngineService,
    private readonly contextService: ContextSubsystem,
    private readonly serviceResolver: ServiceResolverSubsystem,
    @Inject('PIPELINE_FACTORY') private readonly factory: any,
  ) {}

  async run(pipelineName: string, input: any) {
    const requestId = `TEST-${Date.now()}`;
    // Construir contexto manual
    const context: RequestContext = {
      requestId,
      body: input,
      headers: {},
      user: { id: 'u1', email: 'a@b.com', plan: 'basic', permissions: [] },
      meta: { logs: [] },
      services: {},
    };
    // Si necesitan un servicio, lo registran manualmente:
    // this.serviceResolver.register(PlansService, <instanciaPlansService>);
    context.services = {
      // p. ej. PlansService: instancia,
    };

    // Obtener pipeline
    const steps = await this.factory.getPipeline(pipelineName);
    // Ejecutar
    await this.engine.executeWithSteps(context, steps);

    return {
      response: context.response,
      logs: context.meta.logs as StepExecutionLog[],
      errors: context.errors,
    };
  }
}
