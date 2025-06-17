// src/types/express.d.ts
import { RequestContext } from '../pipeline/interfaces/context.interface';

declare module 'express' {
  export interface Request {
    pipelineContext: RequestContext;
  }
}
