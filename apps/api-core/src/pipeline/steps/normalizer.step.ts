// src/pipeline/steps/normalizer.step.ts
import { PipelinePhase } from '../interfaces/pipeline-step.interface';
import { ContextSubsystem } from '../subsystems/context/context.subsystem';
import { StepDefinition } from '../decorators/step-definition.decorator';
import { BaseGenericStep } from './base-step';

@StepDefinition({
  name: 'NormalizerStep',
  phase: PipelinePhase.PROCESSING,
  injects: ['ContextSubsystem'],
})
export class NormalizerStep extends BaseGenericStep {
  // Si hay error de tipado o similar, el pipeline continúa (no es crítico)
  config = { onError: 'continue' as const };

  constructor(ctx: ContextSubsystem) {
    super(ctx);
  }

  getName(): string {
    return 'NormalizerStep';
  }

  getPhase(): PipelinePhase {
    return PipelinePhase.PROCESSING;
  }

  public async execute(requestId: string): Promise<void> {
    const context = this.ctx.getContext(requestId)!;

    // 1) Tomamos el objeto a normalizar
    const source = context.meta.validatedBody ?? context.body;
    if (typeof source === 'object' && source !== null) {
      const normalized: any = {};
      for (const [key, value] of Object.entries(source)) {
        if (typeof value === 'string') {
          // trim y lowercase
          normalized[key] = value.trim().toLowerCase();
        } else {
          normalized[key] = value;
        }
      }
      context.meta.normalizedBody = normalized;
    } else {
      // No hay nada válido que normalizar
      context.meta.normalizedBody = source;
    }

    // 2) Log de éxito
    await super.execute(requestId);
  }
}
