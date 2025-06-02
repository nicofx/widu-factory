// src/pipeline/subsystems/filter/step-filter.subsystem.ts
import { Injectable } from '@nestjs/common';
import { PipelinePhase, PipelineStep } from '../../interfaces/pipeline-step.interface';
import { ContextSubsystem } from '../context/context.subsystem';
import { ExecutionControllerSubsystem } from '../execution-controller/execution-controller.subsystem';

@Injectable()
export class StepFilterSubsystem {
  constructor(
    private readonly executionController: ExecutionControllerSubsystem,
    private readonly contextService: ContextSubsystem,
  ) {}

  public filter(
    phase: PipelinePhase,
    steps: PipelineStep[],
    requestId: string,
  ): PipelineStep[] {
    const context = this.contextService.getContext(requestId);
    if (!context) return [];

    if (!this.executionController.isPhaseEnabled(phase, context)) {
      return [];
    }

    return steps.filter((step) => {
      const stepName = step.constructor.name;
      return this.executionController.isStepEnabled(stepName, context);
    });
  }
}
