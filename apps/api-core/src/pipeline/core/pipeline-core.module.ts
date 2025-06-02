import { Module } from '@nestjs/common';

import { PipelineEngineService } from './pipeline-engine.service';

/* ─── Subsistemas del core ───────────────────────── */
import { ContextSubsystem } from './subsystems/context/context.subsystem';
import { LogCollectorSubsystem } from './subsystems/log/log-collector.subsystem';
import { AuditTrailSubsystem } from './subsystems/audit/audit-trail.subsystem';
import { ErrorManagerSubsystem } from './subsystems/error-manager/error-manager.subsystem';
import { StepFilterSubsystem } from './subsystems/filter/step-filter.subsystem';
import { ExecutionControllerSubsystem } from './subsystems/execution-controller/execution-controller.subsystem';
import { ConfigurationSubsystem } from './subsystems/configuration/configuration.subsystem';
import { ServiceResolverSubsystem } from './subsystems/service/service-resolver.subsystem';

/* ─── Fábrica (renombrada) ───────────────────────── */
import { FrameworkPipelineFactory } from './factory/framework-pipeline.factory';
import { RequestPipelineProvider } from './providers/request-pipeline.provider';
import { StepsController } from './controllers/steps.controller';
import { StepMetadataService } from './services/step-metadata.service';

@Module({
  controllers: [StepsController],          // 👈 nuevo
  
  providers: [
    /* Motor */
    PipelineEngineService,
    /* Fábrica */
    FrameworkPipelineFactory,
    /* Subsistemas */
    ContextSubsystem,
    LogCollectorSubsystem,
    AuditTrailSubsystem,
    ErrorManagerSubsystem,
    StepFilterSubsystem,
    ExecutionControllerSubsystem,
    ConfigurationSubsystem,
    ServiceResolverSubsystem,
    RequestPipelineProvider,
    StepMetadataService,
  ],
  exports: [
    /* Motor y fábrica */
    PipelineEngineService,
    FrameworkPipelineFactory,
    /* Subsistemas (para quien los necesite) */
    ContextSubsystem,
    LogCollectorSubsystem,
    AuditTrailSubsystem,
    ErrorManagerSubsystem,
    StepFilterSubsystem,
    ExecutionControllerSubsystem,
    ConfigurationSubsystem,
    ServiceResolverSubsystem,
    RequestPipelineProvider,
    StepMetadataService
  ],
})
export class PipelineCoreModule {}
