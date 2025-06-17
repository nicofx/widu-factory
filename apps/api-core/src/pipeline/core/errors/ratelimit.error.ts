
// ratelimit.error.ts
import { BasePipelineError } from './base-error';
export class RateLimitError extends BasePipelineError {
  readonly status = 429;
  constructor(msg = 'Too many requests') {
    super(msg);
  }
}
