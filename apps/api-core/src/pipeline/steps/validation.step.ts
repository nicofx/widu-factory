// src/pipeline/steps/validation.step.ts
import { PipelinePhase } from '../interfaces/pipeline-step.interface';
import { ContextSubsystem } from '../subsystems/context/context.subsystem';
import { StepDefinition } from '../decorators/step-definition.decorator';
import { BaseGenericStep } from './base-step';

@StepDefinition({
  name: 'ValidationStep',
  phase: PipelinePhase.PROCESSING,
  injects: ['ContextSubsystem'],
})
export class ValidationStep extends BaseGenericStep {
  // Si falta body o no es objeto, detenemos el pipeline
  config = { onError: 'stop' as const };

  constructor(ctx: ContextSubsystem) {
    super(ctx);
  }

  getName(): string {
    return 'ValidationStep';
  }

  getPhase(): PipelinePhase {
    return PipelinePhase.PROCESSING;
  }

  public async execute(requestId: string): Promise<void> {
    const context = this.ctx.getContext(requestId)!;

    // 1) context.body debe existir y ser un objeto
    if (
      context.body === null ||
      context.body === undefined ||
      typeof context.body !== 'object' ||
      Array.isArray(context.body)
    ) {
      throw new Error('[ValidationStep] El cuerpo de la petición debe ser un objeto JSON.');
    }

    // 2) Debe tener por lo menos una propiedad
    if (Object.keys(context.body).length === 0) {
      throw new Error('[ValidationStep] El body no puede estar vacío.');
    }

    // 3) OK: guardamos validatedBody
    context.meta.validatedBody = { ...context.body };

    // 4) Registrar log de éxito
    await super.execute(requestId);
  }
}
