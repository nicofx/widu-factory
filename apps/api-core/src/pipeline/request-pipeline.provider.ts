// src/pipeline/request-pipeline.provider.ts
import { Provider } from '@nestjs/common';
import { PipelinePhase, PipelineStep, PipelineStepConstructor } from './interfaces/pipeline-step.interface';
import { getStepMetadata } from './decorators/step-definition.decorator';
import * as Steps from './steps';

// Verifica que sea un constructor con método .execute()
function isPipelineStepConstructor(obj: any): obj is PipelineStepConstructor {
  return typeof obj === 'function' && typeof obj.prototype?.execute === 'function';
}

export const RequestPipelineProvider: Provider = {
  provide: 'REQUEST_PIPELINE',
  useFactory: (
    context: any,
    logger: any,
    audit: any,
    error: any
  ): Record<PipelinePhase, PipelineStep[]> => {
    const steps: Record<PipelinePhase, PipelineStep[]> = {
      [PipelinePhase.PRE]: [],
      [PipelinePhase.PROCESSING]: [],
      [PipelinePhase.POST]: [],
    };

    const depsByName: { [key: string]: any } = {
      ContextSubsystem: context,
      LogCollectorSubsystem: logger,
      AuditTrailSubsystem: audit,
      ErrorManagerSubsystem: error,
    };

    for (const StepClass of Object.values(Steps)) {
      if (!isPipelineStepConstructor(StepClass)) continue;
      const meta = getStepMetadata(StepClass);
      if (!meta) continue;

      // Construir instanciando con los subsistemas que pide @StepDefinition.injects
      const constructorDeps = (meta.injects || []).map((name) => depsByName[name]);
      const instance = new (StepClass as PipelineStepConstructor)(...constructorDeps);
      steps[meta.phase].push(instance);
    }
    return steps;
  },
  inject: [
    require('./subsystems/context/context.subsystem').ContextSubsystem,
    require('./subsystems/log/log-collector.subsystem').LogCollectorSubsystem,
    require('./subsystems/audit/audit-trail.subsystem').AuditTrailSubsystem,
    require('./subsystems/error-manager/error-manager.subsystem').ErrorManagerSubsystem,
  ],
};
