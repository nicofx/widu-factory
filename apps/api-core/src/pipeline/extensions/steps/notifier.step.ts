// src/pipeline/steps/notifier.step.ts
import { ContextSubsystem } from '../../core/subsystems/context/context.subsystem';
import { StepDefinition } from '../../decorators/step-definition.decorator';
import { PipelinePhase } from '../../interfaces/pipeline-step.interface';
import { BaseGenericStep } from './base-step';

interface NotificationEntry {
  message: string;
  time: number;
}

@StepDefinition({
  name: 'NotifierStep',
  phase: PipelinePhase.POST,
  injects: ['ContextSubsystem'],
})
export class NotifierStep extends BaseGenericStep {
  // Si falla la notificación, continuamos (no es crítico)
  config = { onError: 'continue' as const };

  constructor(ctx: ContextSubsystem) {
    super(ctx);
  }

  getName(): string {
    return 'NotifierStep';
  }

  getPhase(): PipelinePhase {
    return PipelinePhase.POST;
  }

  public async execute(): Promise<void> {
    const context = this.ctx.getContext()!;

    // 1) Simular envío de notificación (console.log)
    const msg = `Notificación placeholder`;
    console.log(`[NotifierStep] ${msg}`);

    // 2) Push en context.meta.notifications
    if (!Array.isArray(context.meta.notifications)) {
      context.meta.notifications = [];
    }
    const notification: NotificationEntry = {
      message: msg,
      time: Date.now(),
    };
    context.meta.notifications.push(notification);

    // 3) Log de éxito
    await super.execute();
  }
}
