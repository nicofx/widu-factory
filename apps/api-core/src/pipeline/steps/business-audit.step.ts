// src/pipeline/steps/business-audit.step.ts
import { PipelinePhase } from '../interfaces/pipeline-step.interface';
import { ContextSubsystem } from '../subsystems/context/context.subsystem';
import { StepDefinition } from '../decorators/step-definition.decorator';
import { BaseGenericStep } from './base-step';

interface BusinessAuditEntry {
  action: string;
  step: string;
  time: number;
  payload: any;
}

@StepDefinition({
  name: 'BusinessAuditStep',
  phase: PipelinePhase.PROCESSING,
  injects: ['ContextSubsystem'],
})
export class BusinessAuditStep extends BaseGenericStep {
  // Si falla algo, continuamos (no es crítico)
  config = { onError: 'continue' as const };

  constructor(ctx: ContextSubsystem) {
    super(ctx);
  }

  getName(): string {
    return 'BusinessAuditStep';
  }

  getPhase(): PipelinePhase {
    return PipelinePhase.PROCESSING;
  }

  public async execute(requestId: string): Promise<void> {
    const context = this.ctx.getContext(requestId)!;

    // 1) Crear lista si no existe
    if (!Array.isArray(context.meta.businessAudit)) {
      context.meta.businessAudit = [];
    }

    // 2) Construir entrada de auditoría
    const entry: BusinessAuditEntry = {
      action: 'BusinessAudit',
      step: this.getName(),
      time: Date.now(),
      payload: context.meta.processedBody ?? null,
    };
    context.meta.businessAudit.push(entry);

    // 3) También podemos imprimir por consola
    console.log(`[BusinessAuditStep] Audit entry for requestId=${requestId}:`, entry);

    // 4) Log de éxito
    await super.execute(requestId);
  }
}
