// src/core/pipeline/registry/hardcoded-pipeline.factory.ts
import { Injectable } from '@nestjs/common';
import { PipelineFactory } from './pipeline-factory.interface';
import { PipelinePhase, PipelineStep } from '../../pipeline/interfaces/pipeline-step.interface';

// Pasos “core” que ya tenías:
import { LoggingStep } from '../../pipeline/steps/logging-step';
import { NoOpStep } from '../../pipeline/steps/noop-step';
import { ResponseFormatterStep } from '../../pipeline/steps/response-formatter-step';

// Nuevos pasos genéricos “calidad”:
import { HeaderCheckStep } from '../../pipeline/steps/header-check.step';
import { RateLimiterStep } from '../../pipeline/steps/rate-limiter.step';
import { TokenParserStep } from '../../pipeline/steps/token-parser.step';
import { NormalizerStep } from '../../pipeline/steps/normalizer.step';
import { ContextBuilderStep } from '../../pipeline/steps/context-builder.step';
import { BusinessAuditStep } from '../../pipeline/steps/business-audit.step';
import { MetadataTaggerStep } from '../../pipeline/steps/metadata-tagger.step';
import { NotifierStep } from '../../pipeline/steps/notifier.step';
import { TracerStep } from '../../pipeline/steps/tracer.step';

import { ContextSubsystem } from '../../pipeline/subsystems/context/context.subsystem';
import { ServiceResolverSubsystem } from '../../pipeline/subsystems/service/service-resolver.subsystem';
import { ValidationStep } from '../steps/validation.step';

@Injectable()
export class HardcodedPipelineFactory implements PipelineFactory {
  constructor(
    private readonly contextService: ContextSubsystem,
    private readonly serviceResolver: ServiceResolverSubsystem,
  ) {}

  /**
   * Todos los pasos reciben (por convenio) solo ContextSubsystem en el constructor.
   */
  private instantiate(stepClass: new (...args: any[]) => PipelineStep): PipelineStep {
    return new stepClass(this.contextService);
  }

  async getPipeline(name: string): Promise<Record<PipelinePhase, PipelineStep[]>> {
    switch (name) {
      case 'PipelineGenéricoDemo':
        return {
          [PipelinePhase.PRE]: [
            // 3 pasos PRE con lógica real:
            this.instantiate(HeaderCheckStep),
            this.instantiate(RateLimiterStep),
            this.instantiate(TokenParserStep),
          ],
          [PipelinePhase.PROCESSING]: [
            // 4 pasos PROCESSING con lógica real:
            this.instantiate(ValidationStep),
            this.instantiate(NormalizerStep),
            this.instantiate(ContextBuilderStep),
            this.instantiate(BusinessAuditStep),
          ],
          [PipelinePhase.POST]: [
            // 4 pasos POST con lógica real + ResponseFormatter al final
            this.instantiate(MetadataTaggerStep),
            this.instantiate(NotifierStep),
            this.instantiate(TracerStep),
            this.instantiate(ResponseFormatterStep),
          ],
        };
      case 'TestPlanAccessPipeline':
        return {
          [PipelinePhase.PRE]: [this.instantiate(LoggingStep)],
          [PipelinePhase.PROCESSING]: [],
          [PipelinePhase.POST]: [],
        };
      case 'NoOpPipeline':
        return {
          [PipelinePhase.PRE]: [this.instantiate(LoggingStep)],
          [PipelinePhase.PROCESSING]: [this.instantiate(NoOpStep)],
          [PipelinePhase.POST]: [],
        };
      default:
        return this.getDefaultPipeline();
    }
  }

  async getDefaultPipeline(): Promise<Record<PipelinePhase, PipelineStep[]>> {
    return {
      [PipelinePhase.PRE]: [this.instantiate(LoggingStep)],
      [PipelinePhase.PROCESSING]: [],
      [PipelinePhase.POST]: [this.instantiate(ResponseFormatterStep)],
    };
  }
}
