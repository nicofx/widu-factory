// src/pipeline/factory/pipeline-factory.interface.ts
import { PipelinePhase, PipelineStep } from '../interfaces/pipeline-step.interface';
import { RequestContext } from '../interfaces/context.interface';

export interface PipelineFactory {
  /**
   * Devuelve un mapa { pre: PipelineStep[], processing: PipelineStep[], post: PipelineStep[] }
   * ESTÁNDAR: recibe el nombre del pipeline y el context, para que lea config por tenant.
   */
  getPipeline(
    name: string,
    context: RequestContext
  ): Promise<Record<PipelinePhase, PipelineStep[]>>;

  /**
   * Pipeline fallback mínimo si nada más aplica.
   */
  getDefaultPipeline(
    context: RequestContext
  ): Promise<Record<PipelinePhase, PipelineStep[]>>;
}
