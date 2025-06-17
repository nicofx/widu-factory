// src/pipeline/core/providers/request-pipeline.provider.ts
import { Provider } from '@nestjs/common';
import { STEP_REGISTRY } from '../../extensions/steps/step-registry';


import { ContextSubsystem } from '../subsystems/context/context.subsystem';
import { LogCollectorSubsystem } from '../subsystems/log/log-collector.subsystem';
import { AuditTrailSubsystem } from '../subsystems/audit/audit-trail.subsystem';
import { ErrorManagerSubsystem } from '../subsystems/error-manager/error-manager.subsystem';
import { PipelineStep } from '../../interfaces/pipeline-step.interface';

type StepsByPhase = Record<string, PipelineStep[]>;

/** Útil solo como inyección inicial; la factory real sobreescribirá después. */
export const RequestPipelineProvider: Provider = {
  provide: 'REQUEST_PIPELINE',
  useFactory: (
    ctx: ContextSubsystem,
    logger: LogCollectorSubsystem,
    audit: AuditTrailSubsystem,
    err: ErrorManagerSubsystem,
  ): StepsByPhase => {
    // crea un diccionario vacío (no queremos steps por defecto)
    return {};
  },
  inject: [
    ContextSubsystem,
    LogCollectorSubsystem,
    AuditTrailSubsystem,
    ErrorManagerSubsystem,
  ],
};
