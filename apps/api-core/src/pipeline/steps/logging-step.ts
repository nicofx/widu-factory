// src/pipeline/steps/logging-step.ts
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { ContextSubsystem } from '../subsystems/context/context.subsystem';
import { StepDefinition } from '../decorators/step-definition.decorator';

@StepDefinition({
  name: 'LoggingStep',
  phase: PipelinePhase.PRE,
  injects: ['ContextSubsystem'],
})
export class LoggingStep implements PipelineStep {
  config: StepConfig = { onError: 'continue' };
  constructor(private readonly contextService: ContextSubsystem) {}

  async execute(requestId: string): Promise<void> {
    const ctx = this.contextService.getContext(requestId);
    if (ctx) {
      console.log(`[LoggingStep] requestId=${requestId} ─ Body:`, ctx.body);
    } else {
      console.warn(`[LoggingStep] requestId=${requestId} ─ Context not found.`);
    }
  }
}
