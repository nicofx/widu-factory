// src/pipeline/steps/logging-step.ts

import { ContextSubsystem } from "../../core/subsystems/context/context.subsystem";
import { StepDefinition } from "../../decorators/step-definition.decorator";
import { PipelinePhase, PipelineStep, StepConfig } from "../../interfaces/pipeline-step.interface";


@StepDefinition({
  name: 'LoggingStep',
  phase: PipelinePhase.PRE,
  injects: ['ContextSubsystem'],
})
export class LoggingStep implements PipelineStep {
  config: StepConfig = { onError: 'continue' };
  constructor(private readonly contextService: ContextSubsystem) {}

  async execute(): Promise<void> {
    const ctx = this.contextService.getContext();
    if (ctx) {
      console.log(`[LoggingStep] ─ Body:`, ctx.body);
    } else {
      console.warn(`[LoggingStep] ─ Context not found.`);
    }
  }
}
