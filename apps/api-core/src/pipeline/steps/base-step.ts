// src/pipeline/steps/base-step.ts
import { PipelineStep, PipelinePhase, StepConfig } from '../interfaces/pipeline-step.interface';
import { ContextSubsystem } from '../subsystems/context/context.subsystem';
import { StepDefinition } from '../decorators/step-definition.decorator';
import { StepExecutionLog } from '../interfaces/context.interface';

@StepDefinition({
  name: 'BaseGenericStep',
  phase: PipelinePhase.PRE, // este valor es irrelevante en la práctica; cada subclase lo overridea
  injects: ['ContextSubsystem'],
})
export abstract class BaseGenericStep implements PipelineStep {
  config: StepConfig = { onError: 'continue' };

  protected readonly ctx: ContextSubsystem;

  constructor(ctx: ContextSubsystem) {
    this.ctx = ctx;
  }

  /** Nombre textual del paso. Cada subclase sobreescribe. */
  abstract getName(): string;

  /** Fase a la que pertenece: PRE | PROCESSING | POST. */
  abstract getPhase(): PipelinePhase;

  public async execute(requestId: string): Promise<void> {
    // 1) Tomar el RequestContext
    const context = this.ctx.getContext(requestId);
    if (!context) {
      // Si no existe contexto, simplemente retornamos (no podemos avanzar).
      throw new Error(`[${this.getName()}] Contexto no encontrado para requestId=${requestId}`);
    }

    // 2) Iniciar medición de tiempo
    const start = Date.now();

    // 3) Placeholder: aquí cada subclase puede ejecutar LÓGICA real o extender.
    //    En esta implementación base no hay lógica de negocio: queda para la subclase.
    //    Ejemplo: await this.doWork(requestId);

    // 4) Calcular duración
    const duration = Date.now() - start;

    // 5) Push al log de ejecución
    const logEntry: StepExecutionLog = {
      phase: this.getPhase(),
      step: this.getName(),
      status: 'success',
      durationMs: duration,
    };
    context.meta.logs.push(logEntry);

    // 6) Imprimir en consola para debugging
    console.log(
      `[${this.getName()}] (${this.getPhase()}) requestId=${requestId} → OK (${duration} ms)`
    );
  }
}
