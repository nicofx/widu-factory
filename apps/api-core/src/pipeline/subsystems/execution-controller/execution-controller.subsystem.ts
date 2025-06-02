// src/pipeline/subsystems/execution-controller/execution-controller.subsystem.ts
import { Injectable } from '@nestjs/common';
import { PipelinePhase } from '../../interfaces/pipeline-step.interface';
import { RequestContext } from '../../interfaces/context.interface';
import { ConfigurationSubsystem } from '../configuration/configuration.subsystem';

@Injectable()
export class ExecutionControllerSubsystem {
  constructor(private readonly config: ConfigurationSubsystem) {}

  public isPhaseEnabled(
    phase: PipelinePhase,
    context: RequestContext,
  ): boolean {
    const cfg = this.config.getConfig(context);
    if (cfg.disabledPhases && Array.isArray(cfg.disabledPhases)) {
      return !cfg.disabledPhases.includes(phase);
    }
    return true;
  }

  public isStepEnabled(stepName: string, context: RequestContext): boolean {
    const cfg = this.config.getConfig(context);
    if (cfg.disabledSteps && Array.isArray(cfg.disabledSteps)) {
      return !cfg.disabledSteps.includes(stepName);
    }
    return true;
  }
}
