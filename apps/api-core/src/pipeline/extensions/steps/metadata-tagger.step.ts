// src/pipeline/steps/metadata-tagger.step.ts
import { ContextSubsystem } from '../../core/subsystems/context/context.subsystem';
import { StepDefinition } from '../../decorators/step-definition.decorator';
import { PipelinePhase } from '../../interfaces/pipeline-step.interface';
import { BaseGenericStep } from './base-step';

@StepDefinition({
  name: 'MetadataTaggerStep',
  phase: PipelinePhase.POST,
  injects: ['ContextSubsystem'],
})
export class MetadataTaggerStep extends BaseGenericStep {
  // Si algo falla aquí, continuamos (no es crítico)
  config = { onError: 'continue' as const };

  constructor(ctx: ContextSubsystem) {
    super(ctx);
  }

  getName(): string {
    return 'MetadataTaggerStep';
  }

  getPhase(): PipelinePhase {
    return PipelinePhase.POST;
  }

  public async execute(): Promise<void> {
    const context = this.ctx.getContext()!;

    // 1) Agregar tags genéricos a context.meta
    context.meta.responseTags = {
      version: '1.0',
      env: process.env.NODE_ENV ?? 'dev',
      taggedAt: new Date().toISOString(),
    };

    // 2) Log de éxito
    await super.execute();
  }
}
