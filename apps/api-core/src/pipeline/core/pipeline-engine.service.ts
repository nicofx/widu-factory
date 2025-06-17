// src/pipeline/core/pipeline-engine.service.ts
import { Injectable, Logger } from '@nestjs/common';

import { PipelineStep } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';
import { getStepMetadata } from '../decorators/step-definition.decorator';

/* ── Subsistemas ────────────────────────────────────── */
import { AuditTrailSubsystem } from './subsystems/audit/audit-trail.subsystem';
import { ErrorManagerSubsystem } from './subsystems/error-manager/error-manager.subsystem';
import { StepFilterSubsystem } from './subsystems/filter/step-filter.subsystem';
import { ContextSubsystem } from './subsystems/context/context.subsystem';
import { LogCollectorSubsystem } from './subsystems/log/log-collector.subsystem';

/* AsyncLocalStorage wrapper */
import { asyncContext } from './als/async-context';

/**
 * Motor de ejecución de pipelines.
 *
 * 1. Corre todo dentro de AsyncLocalStorage => cualquier Step puede
 *    llamar this.ctx.getContext() sin parámetros.
 * 2. Soporta fases dinámicas, condicionales y pasos paralelos.
 * 3. Registra auditoría, logs y maneja errores según onError.
 */
@Injectable()
export class PipelineEngineService {
  private readonly logger = new Logger(PipelineEngineService.name);

  constructor(
    private readonly audit: AuditTrailSubsystem,
    private readonly errorManager: ErrorManagerSubsystem,
    private readonly filter: StepFilterSubsystem,
    private readonly ctxService: ContextSubsystem,
    private readonly logCollector: LogCollectorSubsystem,
  ) {}

  /**
   * Ejecuta un pipeline ya instanciado.
   * @param context       Contexto de la petición
   * @param stepsByPhase  Mapa { fase: PipelineStep[] }
   */
  async executeWithSteps(
    context: RequestContext,
    stepsByPhase: Record<string, PipelineStep[]>,
  ): Promise<void> {
    /* 1) Creamos un ámbito ALS que vive durante todo el pipeline */
    await asyncContext.run(context, async () => {
      /* 2) Recorremos fases en el orden de llegada */
      for (const phaseName of Object.keys(stepsByPhase)) {
        const original = stepsByPhase[phaseName] ?? [];
        const phaseSteps = this.filter.filter(phaseName, original);
        if (phaseSteps.length === 0) {
          this.logger.debug(
            `[Pipeline] Fase "${phaseName}" sin steps habilitados`,
          );
          continue;
        }

        /* Agrupar por paralelizable */
        const parallel   = phaseSteps.filter((s) => s.config?.parallelizable);
        const sequential = phaseSteps.filter((s) => !s.config?.parallelizable);

        /* Ejecutar paralelos */
        if (parallel.length) {
          await Promise.all(
            parallel.map((s) => this.runSingleStep(s, phaseName, context)),
          );
        }

        /* Ejecutar secuenciales en orden */
        for (const step of sequential) {
          await this.runSingleStep(step, phaseName, context);
        }
      }
      /* 3) Al salir del run(), ALS descarta el contexto automáticamente */
    });
  }

  // ───────────────────────── helpers ──────────────────────────

  /** Ejecuta y monitorea un paso individual */
  private async runSingleStep(
    step: PipelineStep,
    phaseName: string,
    context: RequestContext,
  ): Promise<void> {
    const start = Date.now();
    const meta = getStepMetadata(step.constructor);
    const stepName = meta?.name ?? step.constructor.name;

    await this.audit.logEvent('StepStarted', { step: stepName, phase: phaseName });

    try {
      await step.execute(); // 👈 sin requestId

      const duration = Date.now() - start;
      await this.audit.logEvent('StepSucceeded', {
        step: stepName,
        phase: phaseName,
        durationMs: duration,
      });
      this.logCollector.collect(context, {
        phase: phaseName,
        step: stepName,
        status: 'success',
        durationMs: duration,
      });
    } catch (err: any) {
      const duration = Date.now() - start;

      await this.errorManager.handle(err, context, stepName);
      await this.audit.logEvent('StepFailed', {
        step: stepName,
        phase: phaseName,
        durationMs: duration,
        error: err.message,
      });
      this.logCollector.collect(context, {
        phase: phaseName,
        step: stepName,
        status: 'error',
        durationMs: duration,
        details: err.message,
      });

      /* Abortamos si el paso no permite continuar */
      if (step.config?.onError !== 'continue') {
        throw err; // capturado por filtro global
      }
    }
  }
}
