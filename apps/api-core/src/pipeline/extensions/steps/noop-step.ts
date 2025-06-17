// src/pipeline/steps/noop-step.ts

import { ContextSubsystem } from "../../core/subsystems/context/context.subsystem";
import { StepDefinition } from "../../decorators/step-definition.decorator";
import { PipelinePhase, PipelineStep, StepConfig } from "../../interfaces/pipeline-step.interface";


@StepDefinition({
  name: 'NoOpStep',
  phase: PipelinePhase.PROCESSING,
  injects: ['ContextSubsystem'],
})
export class NoOpStep implements PipelineStep {
  config: StepConfig = { onError: 'continue' };

  constructor(private readonly contextService: ContextSubsystem) {}

  async execute(): Promise<void> {
    // No hace nada, solo simula un paso
    console.log(`[NoOpStep] ─ NoOp ejecutado`);
  }
}
