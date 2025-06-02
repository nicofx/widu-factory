// src/pipeline/steps/response-formatter-step.ts
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { ContextSubsystem } from '../subsystems/context/context.subsystem';
import { StepDefinition } from '../decorators/step-definition.decorator';

@StepDefinition({
  name: 'ResponseFormatterStep',
  phase: PipelinePhase.POST,
  injects: ['ContextSubsystem'],
})
export class ResponseFormatterStep implements PipelineStep {
  name = 'ResponseFormatterStep';
  phase = PipelinePhase.POST;
  config = { onError: 'continue' as const };

  constructor(private readonly contextService: ContextSubsystem) {}

  async execute(requestId: string): Promise<void> {
    const ctx = this.contextService.getContext(requestId);
    if (!ctx) throw new Error('[ResponseFormatterStep] Contexto no encontrado');

    const duration = Date.now() - Number(ctx.requestId.replace('REQ-', ''));
    ctx.response = {
      success: true,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      durationMs: duration,
      result: ctx.meta.validatedBody ?? {},
      logs: ctx.meta.logs,
    };
  }
}
