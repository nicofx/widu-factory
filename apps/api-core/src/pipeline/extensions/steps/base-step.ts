// src/pipeline/steps/base-step.ts

import { ContextSubsystem } from "../../core/subsystems/context/context.subsystem";
import { StepDefinition } from "../../decorators/step-definition.decorator";
import { StepExecutionLog } from "../../interfaces/context.interface";
import { PipelinePhase, PipelineStep, StepConfig } from "../../interfaces/pipeline-step.interface";


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

  public async execute(): Promise<void> {
    // 1) Tomar el RequestContext
    const context = this.ctx.getContext();
    if (!context) {
      // Si no existe contexto, simplemente retornamos (no podemos avanzar).
      throw new Error(`[${this.getName()}] Contexto no encontrado`);
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
      `[${this.getName()}] (${this.getPhase()} → OK (${duration} ms)`
    );
  }
}
