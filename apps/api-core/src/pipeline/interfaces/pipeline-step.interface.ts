// src/pipeline/interfaces/pipeline-step.interface.ts
export interface StepConfig {
  async?: boolean;
  parallelizable?: boolean;
  blocking?: boolean;
  critical?: boolean;
  onError?: 'continue' | 'stop' | 'skip' | 'retry';
}

export enum PipelinePhase {
  PRE = 'pre',
  PROCESSING = 'processing',
  POST = 'post',
}

export interface PipelineStep {
  execute(requestId: string): Promise<void>;
  config?: StepConfig;
}

// Para poder instanciar Steps dinámicamente
export interface PipelineStepConstructor {
  new (...args: any[]): PipelineStep;
}
