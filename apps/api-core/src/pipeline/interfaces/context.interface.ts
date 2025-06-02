// src/pipeline/interfaces/context.interface.ts

export interface StepExecutionLog {
  phase: string;
  step: string;
  status: 'success' | 'error' | 'skipped';
  durationMs: number;
  details?: any;
}

export interface RequestContext {
  requestId: string;
  body: any;
  headers: Record<string, any>;
  user?: any;
  result?: any;
  errors?: any[];
  response?: any;
  // Cualquier dato extra que necesiten los Steps
  services?: Record<string, any>;
  // Metadatos internos: logs de steps, validaciones, permisos, etc.
  meta: {
    logs: StepExecutionLog[];
    [key: string]: any;
  };
}
