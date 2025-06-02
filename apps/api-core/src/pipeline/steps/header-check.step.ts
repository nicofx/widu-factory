// src/pipeline/steps/header-check.step.ts
import { PipelinePhase } from '../interfaces/pipeline-step.interface';
import { ContextSubsystem } from '../subsystems/context/context.subsystem';
import { StepDefinition } from '../decorators/step-definition.decorator';
import { BaseGenericStep } from './base-step';

@StepDefinition({
  name: 'HeaderCheckStep',
  phase: PipelinePhase.PRE,
  injects: ['ContextSubsystem'],
})
export class HeaderCheckStep extends BaseGenericStep {
  // Queremos detener el pipeline si falla la validación
  config = { onError: 'stop' as const };

  constructor(ctx: ContextSubsystem) {
    super(ctx);
  }

  getName(): string {
    return 'HeaderCheckStep';
  }

  getPhase(): PipelinePhase {
    return PipelinePhase.PRE;
  }

  public async execute(requestId: string): Promise<void> {
    const context = this.ctx.getContext(requestId)!;

    // 1) Verificar que haya header "content-type" conteniendo "application/json"
    const contentType = context.headers['content-type'] as string | undefined;
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('[HeaderCheckStep] Falta header "content-type: application/json"');
    }

    // 2) Podemos chequear también que venga un header "x-tenant" (opcional)
    const tenant = context.headers['x-tenant'];
    if (!tenant) {
      // Si no hay x-tenant, usamos “default”, pero no lanzamos error.  
      context.meta.tenant = 'default';
    } else {
      context.meta.tenant = String(tenant);
    }

    // 3) Llamamos al base para registrar log de éxito
    await super.execute(requestId);
  }
}
