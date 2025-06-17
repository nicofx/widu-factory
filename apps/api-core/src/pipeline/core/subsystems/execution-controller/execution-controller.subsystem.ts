// src/pipeline/subsystems/execution-controller/execution-controller.subsystem.ts
import { Injectable } from '@nestjs/common';
import { ConfigurationSubsystem } from '../configuration/configuration.subsystem';
import { PipelinePhase } from '../../../interfaces/pipeline-step.interface';
import { RequestContext } from '../../../interfaces/context.interface';

@Injectable()
export class ExecutionControllerSubsystem {
  constructor(private readonly config: ConfigurationSubsystem) {}
  
  public isPhaseEnabled(phaseName: string, context: RequestContext): boolean {
    const cfg = this.config.getConfig(context);
    return !(cfg.disabledPhases ?? []).includes(phaseName);
  }
  
  public isStepEnabled(stepName: string, context: RequestContext): boolean {
    const cfg = this.config.getConfig(context);
    if (cfg.disabledSteps && Array.isArray(cfg.disabledSteps)) {
      return !cfg.disabledSteps.includes(stepName);
    }
    return true;
  }
}
