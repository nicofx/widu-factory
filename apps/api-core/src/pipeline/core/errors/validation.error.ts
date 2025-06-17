// validation.error.ts
import { BasePipelineError } from './base-error';
export class ValidationError extends BasePipelineError {
  readonly status = 400;
  constructor(public details: any, msg = 'Invalid payload') {
    super(msg);
  }
}