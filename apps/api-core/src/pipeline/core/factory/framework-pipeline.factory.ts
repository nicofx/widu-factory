import { Injectable, Logger } from '@nestjs/common';

import { RequestContext } from '../../interfaces/context.interface';

import { STEP_REGISTRY } from '../../extensions/steps/step-registry';
import { ConfigurationSubsystem } from '../subsystems/configuration/configuration.subsystem';
import { ContextSubsystem } from '../subsystems/context/context.subsystem';

import { ElementConfig, PipelineConfig } from '../dto/pipeline-config.dto';
import { evaluateCondition } from '../utils/evaluate-condition.util';
import { PipelineFactory } from '../../interfaces/pipeline-factory.interface';
import { PipelineStepConstructor } from '../../interfaces/pipeline-step.interface';

@Injectable()
export class FrameworkPipelineFactory implements PipelineFactory {
  private readonly logger = new Logger(FrameworkPipelineFactory.name);
  
  constructor(
    private readonly cfgService: ConfigurationSubsystem,
    private readonly ctxService: ContextSubsystem,
  ) {}
  
  /* ─────────────────────────────────────────────────────────────
  *  Método público que el interceptor llama para construir
  *  el pipeline de la petición.
  * ──────────────────────────────────────────────────────────── */
  async getPipeline(
    name: string,
    context: RequestContext,
  ): Promise<Record<string, any>> {
    const cfg = this.cfgService.getConfig(context) as PipelineConfig;
    
    /* ===== 1) Compatibilidad con esquema antiguo (pipelines.*) ===== */
    if (cfg.pipelines && cfg.pipelines[name]) {
      this.logger.warn(`⚠️  Usando esquema LEGACY pipelines.${name}`);
      return this.legacyToDynamic(cfg.pipelines[name], context);
    }
    if (cfg.pipelines && cfg.pipelines['default'] && name !== 'default') {
      this.logger.warn(
        `Pipeline "${name}" no hallado; fallback legacy pipelines.default`,
      );
      return this.legacyToDynamic(cfg.pipelines['default'], context);
    }
    
    /* ===== 2) Esquema nuevo ===== */
    if (!Array.isArray(cfg.phases) || cfg.phases.length === 0) {
      this.logger.error('No se encontró phases[] en configuración.');
      return this.getDefaultPipeline(context);
    }
    
    const result: Record<string, any> = {};
    for (const phaseName of cfg.phases) {
      const phaseCfg = (cfg as any)[phaseName] ?? {};
      const orderedElements: Array<string | ElementConfig> = [
        ...(phaseCfg.hooksBefore ?? []),
        ...(phaseCfg.steps ?? []),
        ...(phaseCfg.hooksAfter ?? []),
      ];
      
      /*  Instanciar cada elemento (string u objeto)  */
      const instantiated = orderedElements
      .map((el) => this.createAndConfigure(el, context))
      .filter(Boolean) as any[]; // quita null (condición “if” falsa)
      
      result[phaseName] = instantiated;
    }
    
    return result;
  }
  
  /* ──────────────────────────────────────────────────────────── */
  /** Crea un PipelineStep a partir de string o { name,… }. */
  private createAndConfigure(
    element: string | ElementConfig,
    ctx: RequestContext,
  ) {
    /* --- 1) Resolver nombre --- */
    const name = typeof element === 'string' ? element : element.name;
    
    /* --- 2) Evaluar condición `if` si aplica --- */
    if (typeof element !== 'string') {
      const ok = evaluateCondition(element.if, ctx);
      if (!ok) return null; // omitido por condición
    }
    
    /* --- 3) Instanciar la clase de Step / Hook --- */
    const StepClass = STEP_REGISTRY[name] as PipelineStepConstructor; // 👈 cast explícito
    if (!StepClass) {
      throw new Error(`Paso/Hook "${name}" no registrado en STEP_REGISTRY`);
    }
    const instance = new StepClass(this.ctxService);
    
    /* --- 4) Aplicar flags parallel / overrides de config --- */
    if (typeof element !== 'string') {
      instance.config = {
        ...instance.config,
        parallelizable: element.parallel ?? false,
        ...element.configOverride,
      };
    }
    
    return instance;
  }
  
  /* ──────────────────────────────────────────────────────────── */
  /** Convierte el objeto legacy ({ pre:[], processing:[], … }) */
  private legacyToDynamic(
    legacyObj: any,
    ctx: RequestContext,
  ): Record<string, any> {
    const phases = ['pre', 'processing', 'post'];
    const out: Record<string, any> = {};
    phases.forEach((p) => {
      out[p] = (legacyObj[p] ?? []).map((n: string) =>
        this.createAndConfigure(n, ctx),
    );
  });
  return out;
}

/* ──────────────────────────────────────────────────────────── */
/** Pipeline mínimo si no hay config válida. */
async getDefaultPipeline(
  context: RequestContext,               // 👈 acepta el contexto
): Promise<Record<string, any>> {
  /* usamos el mismo context al instanciar los pasos */
  const pre  = [this.createAndConfigure('LoggingStep', context)];
  const post = [this.createAndConfigure('ResponseFormatterStep', context)];
  return { pre, processing: [], post };
}
}
