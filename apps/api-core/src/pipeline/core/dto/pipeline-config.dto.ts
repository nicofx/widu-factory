import { StepConfig } from "../../interfaces/pipeline-step.interface";

export interface ElementConfig {
  name: string;
  if?: string;                        // condición a evaluar
  parallel?: boolean;                 // true → paralelizable
  configOverride?: Partial<StepConfig>;
}

export interface PhaseConfig {
  hooksBefore?: Array<string | ElementConfig>;
  steps?: Array<string | ElementConfig>;
  hooksAfter?: Array<string | ElementConfig>;
}

export interface PipelineConfig {
  schemaVersion?: string;
  phases: string[];                 // orden de ejecución
  disabledPhases?: string[];
  disabledSteps?: string[];
  pipelines?: Record<string, any>;  // se mantiene para compatibilidad v1
  [phase: string]: any;             // “pre”, “processing”, “post”, fases dinámicas…
}
