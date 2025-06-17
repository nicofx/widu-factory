// src/pipeline/steps/tracer.step.ts
import { ContextSubsystem } from '../../core/subsystems/context/context.subsystem';
import { StepDefinition } from '../../decorators/step-definition.decorator';
import { PipelinePhase } from '../../interfaces/pipeline-step.interface';
import { BaseGenericStep } from './base-step';

interface TraceEntry {
  step: string;
  timestamp: number;
}

@StepDefinition({
  name: 'TracerStep',
  phase: PipelinePhase.POST,
  injects: ['ContextSubsystem'],
})
export class TracerStep extends BaseGenericStep {
  // Si falla, continuamos (no crítico)
  config = { onError: 'continue' as const };

  constructor(ctx: ContextSubsystem) {
    super(ctx);
  }

  getName(): string {
    return 'TracerStep';
  }

  getPhase(): PipelinePhase {
    return PipelinePhase.POST;
  }

  public async execute(): Promise<void> {
    const context = this.ctx.getContext()!;

    // 1) Inicializar array de trazas si no existe
    if (!Array.isArray(context.meta.traceSteps)) {
      context.meta.traceSteps = [];
    }

    // 2) Agregar un entry de trazo
    const entry: TraceEntry = {
      step: this.getName(),
      timestamp: Date.now(),
    };
    context.meta.traceSteps.push(entry);

    // 3) También imprimir un console.log
    console.log(`[TracerStep] Se añadió trazo:`, entry);

    // 4) Log de éxito
    await super.execute();
  }
}
