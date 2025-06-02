// src/pipeline/subsystems/filter/step-filter.subsystem.ts
import { Injectable } from '@nestjs/common';
import { ContextSubsystem } from '../context/context.subsystem';
import { ExecutionControllerSubsystem } from '../execution-controller/execution-controller.subsystem';
import { PipelinePhase, PipelineStep } from '../../../interfaces/pipeline-step.interface';

@Injectable()
export class StepFilterSubsystem {
  constructor(
    private readonly executionController: ExecutionControllerSubsystem,
    private readonly contextService: ContextSubsystem,
  ) {}
  
  public filter(
    phaseName: string,
    steps: PipelineStep[],
  ): PipelineStep[] {
    const context = this.contextService.getContext();
    if (!context) return [];
    
    if (!this.executionController.isPhaseEnabled(phaseName, context)) return [];
    
    return steps.filter((step) => {
      const stepName = step.constructor.name;
      return this.executionController.isStepEnabled(stepName, context);
    });
  }
}
