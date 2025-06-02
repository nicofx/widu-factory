// src/pipeline/engine/pipeline-engine.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { LogCollectorSubsystem } from './subsystems/log/log-collector.subsystem';
import { ContextSubsystem } from './subsystems/context/context.subsystem';
import { PipelinePhase, PipelineStep } from './interfaces/pipeline-step.interface';
import { AuditTrailSubsystem } from './subsystems/audit/audit-trail.subsystem';
import { ErrorManagerSubsystem } from './subsystems/error-manager/error-manager.subsystem';
import { StepFilterSubsystem } from './subsystems/filter/step-filter.subsystem';
import { RequestContext } from './interfaces/context.interface';
import { getStepMetadata } from './decorators/step-definition.decorator';


@Injectable()
export class PipelineEngineService {
  constructor(
    @Inject('REQUEST_PIPELINE')
    private readonly stepsByPhase: Record<PipelinePhase, PipelineStep[]>,
    private readonly audit: AuditTrailSubsystem,
    private readonly errorManager: ErrorManagerSubsystem,
    private readonly filter: StepFilterSubsystem,
    private readonly contextService: ContextSubsystem,
    private readonly logCollector: LogCollectorSubsystem,
  ) {}

  async executeWithSteps(
    context: RequestContext,
    stepsByPhase: Record<PipelinePhase, PipelineStep[]>,
  ): Promise<void> {
    // 1) almacenar el contexto para que los Steps puedan leerlo
    this.contextService.setContext(context);

    // 2) iterar por cada fase (pre, processing, post)
    for (const phase of Object.values(PipelinePhase)) {
      const phaseSteps = this.filter.filter(phase, stepsByPhase[phase] || [], context.requestId);
      if (phaseSteps.length === 0) {
        console.log(`[PipelineEngine] Fase "${phase}" sin steps habilitados`);
        continue;
      }

      for (const step of phaseSteps) {
        const start = Date.now();
        const meta = getStepMetadata(step.constructor);
        const stepName = meta?.name || 'UnknownStep';

        await this.audit.logEvent('StepStarted', { step: stepName, phase });
        try {
          await step.execute(context.requestId);
          const duration = Date.now() - start;
          await this.audit.logEvent('StepSucceeded', { step: stepName, phase, durationMs: duration });
          this.logCollector.collect(context, {
            phase,
            step: stepName,
            status: 'success',
            durationMs: duration,
          });
        } catch (err: any) {
          const duration = Date.now() - start;
          await this.errorManager.handle(err, context, stepName);
          await this.audit.logEvent('StepFailed', {
            step: stepName,
            phase,
            durationMs: duration,
            error: err.message,
          });
          this.logCollector.collect(context, {
            phase,
            step: stepName,
            status: 'error',
            durationMs: duration,
            details: err.message || err,
          });
          if (step.config?.onError !== 'continue') {
            this.contextService.deleteContext(context.requestId);
            throw err;
          }
        }
      }
    }

    // 3) al final eliminar el contexto
    this.contextService.deleteContext(context.requestId);
  }
}
