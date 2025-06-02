// src/pipeline/engine/runtime-pipeline.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { PipelineEngineService } from './pipeline-engine.service';
import { ContextSubsystem } from './subsystems/context/context.subsystem';
import { ServiceResolverSubsystem } from './subsystems/service/service-resolver.subsystem';
import { ConfigurationSubsystem } from './subsystems/configuration/configuration.subsystem';
import { ExecutionControllerSubsystem } from './subsystems/execution-controller/execution-controller.subsystem';
import { StepFilterSubsystem } from './subsystems/filter/step-filter.subsystem';
import { ErrorManagerSubsystem } from './subsystems/error-manager/error-manager.subsystem';
import { AuditTrailSubsystem } from './subsystems/audit/audit-trail.subsystem';
import { LogCollectorSubsystem } from './subsystems/log/log-collector.subsystem';
import { RequestPipelineProvider } from './request-pipeline.provider';
import { PipelineFactoryModule } from './factory/pipeline-factory.module';

@Module({
  imports: [
    forwardRef(() => PipelineFactoryModule),
  ],
  providers: [
    PipelineEngineService,
    RequestPipelineProvider,
    ContextSubsystem,
    LogCollectorSubsystem,
    AuditTrailSubsystem,
    ErrorManagerSubsystem,
    StepFilterSubsystem,
    ExecutionControllerSubsystem,
    ConfigurationSubsystem,        // <— aquí
    ServiceResolverSubsystem,
  ],
  // Exportamos TODO lo que necesita cualquiera que importe este módulo:
  exports: [
    PipelineEngineService,
    ContextSubsystem,
    ServiceResolverSubsystem,
    ConfigurationSubsystem,        // <— añadir este
  ],
})
export class RuntimePipelineModule {}
