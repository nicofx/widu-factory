// src/pipeline/steps/context-builder.step.ts
import { PipelinePhase } from '../interfaces/pipeline-step.interface';
import { ContextSubsystem } from '../subsystems/context/context.subsystem';
import { StepDefinition } from '../decorators/step-definition.decorator';
import { BaseGenericStep } from './base-step';

@StepDefinition({
  name: 'ContextBuilderStep',
  phase: PipelinePhase.PROCESSING,
  injects: ['ContextSubsystem'],
})
export class ContextBuilderStep extends BaseGenericStep {
  // Continuamos aun si hay algún detalle (no crítico)
  config = { onError: 'continue' as const };

  constructor(ctx: ContextSubsystem) {
    super(ctx);
  }

  getName(): string {
    return 'ContextBuilderStep';
  }

  getPhase(): PipelinePhase {
    return PipelinePhase.PROCESSING;
  }

  public async execute(requestId: string): Promise<void> {
    const context = this.ctx.getContext(requestId)!;

    // 1) Timestamp de recepción
    context.meta.requestReceivedAt = new Date().toISOString();
    // 2) Correlation ID = requestId
    context.meta.correlationId = requestId;
    // 3) Copiar “processedBody” para facilitar uso posterior
    context.meta.processedBody = context.meta.normalizedBody ?? context.meta.validatedBody ?? context.body;

    // 4) Log de éxito
    await super.execute(requestId);
  }
}
