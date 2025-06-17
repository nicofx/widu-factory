// authorization.error.ts
import { BasePipelineError } from './base-error';
export class AuthorizationError extends BasePipelineError {
  readonly status = 403;
  constructor(msg = 'Forbidden') {
    super(msg);
  }
}
