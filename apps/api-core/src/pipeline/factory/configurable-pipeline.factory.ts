// src/pipeline/factory/configurable-pipeline.factory.ts
import { Injectable, Logger } from '@nestjs/common';
import { PipelineFactory } from './pipeline-factory.interface';
import { PipelinePhase, PipelineStep } from '../interfaces/pipeline-step.interface';
import { ConfigurationSubsystem } from '../subsystems/configuration/configuration.subsystem';
import { ContextSubsystem } from '../subsystems/context/context.subsystem';
import { STEP_REGISTRY } from '../steps/step-registry';
import { RequestContext } from '../interfaces/context.interface';

@Injectable()
export class ConfigurablePipelineFactory implements PipelineFactory {
  private readonly logger = new Logger(ConfigurablePipelineFactory.name);

  constructor(
    private readonly configService: ConfigurationSubsystem,
    private readonly contextService: ContextSubsystem,
  ) {}

  /**
   * Construye y retorna el pipeline según JSON de tenant (o default.json) basado en 'name'.
   */
  async getPipeline(
    name: string,
    context: RequestContext
  ): Promise<Record<PipelinePhase, PipelineStep[]>> {
    // 1) Obtener el config mergeado entre default + tenant
    const cfg = this.configService.getConfig(context);
    const pipelinesCfg: Record<string, any> = cfg.pipelines || {};

    // 2) Primero intento el pipeline específico:
    let pipelineDef = pipelinesCfg[name];

    // 3) Si no existe, uso el pipeline “default” del JSON:
    if (!pipelineDef) {
      pipelineDef = pipelinesCfg['default'];
      this.logger.warn(`Pipeline "${name}" no encontrado en config; usando "default".`);
    }

    // 4) Si aún así no hay definición (ni “name” ni “default”), hago fallback mínimo:
    if (!pipelineDef) {
      this.logger.error(`No hay pipeline "default" en JSON. Usando fallback mínimo.`);
      return this.getDefaultPipeline(context);
    }

    // 5) Para cada fase, instanciar pasos según el array de strings:
    const result: Record<PipelinePhase, PipelineStep[]> = {
      [PipelinePhase.PRE]: [],
      [PipelinePhase.PROCESSING]: [],
      [PipelinePhase.POST]: [],
    };

    // Helper para instanciar un step dado su nombre:
    const instantiateStep = (stepName: string): PipelineStep => {
      const StepClass = STEP_REGISTRY[stepName];
      if (!StepClass) {
        throw new Error(`Paso "${stepName}" no registrado en STEP_REGISTRY.`);
      }
      return new StepClass(this.contextService);
    };

    // 6) Recorrer las tres fases: “pre”, “processing”, “post”
    for (const phase of Object.values(PipelinePhase) as PipelinePhase[]) {
      const phaseKey = phase as keyof typeof pipelineDef;
      const stepNames: string[] = Array.isArray(pipelineDef[phaseKey])
        ? pipelineDef[phaseKey]
        : [];

      for (const stepName of stepNames) {
        result[phase].push(instantiateStep(stepName));
      }
    }

    return result;
  }

  /**
   * Fallback mínimo si ni "name" ni "default" aparecen en JSON:
   * LoggingStep en PRE, vacíos en PROCESSING, ResponseFormatter en POST.
   */
  async getDefaultPipeline(
    context: RequestContext
  ): Promise<Record<PipelinePhase, PipelineStep[]>> {
    const result: Record<PipelinePhase, PipelineStep[]> = {
      [PipelinePhase.PRE]: [],
      [PipelinePhase.PROCESSING]: [],
      [PipelinePhase.POST]: [],
    };
    // Intento instanciar LoggingStep y ResponseFormatterStep si están registrados
    if (STEP_REGISTRY['LoggingStep']) {
      result[PipelinePhase.PRE].push(new STEP_REGISTRY['LoggingStep'](this.contextService));
    }
    if (STEP_REGISTRY['ResponseFormatterStep']) {
      result[PipelinePhase.POST].push(new STEP_REGISTRY['ResponseFormatterStep'](this.contextService));
    }
    return result;
  }
}
