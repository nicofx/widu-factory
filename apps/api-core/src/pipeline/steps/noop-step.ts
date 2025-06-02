// src/pipeline/steps/noop-step.ts
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { ContextSubsystem } from '../subsystems/context/context.subsystem';
import { StepDefinition } from '../decorators/step-definition.decorator';

@StepDefinition({
  name: 'NoOpStep',
  phase: PipelinePhase.PROCESSING,
  injects: ['ContextSubsystem'],
})
export class NoOpStep implements PipelineStep {
  config: StepConfig = { onError: 'continue' };

  constructor(private readonly contextService: ContextSubsystem) {}

  async execute(requestId: string): Promise<void> {
    // No hace nada, solo simula un paso
    console.log(`[NoOpStep] requestId=${requestId} ─ NoOp ejecutado`);
  }
}
