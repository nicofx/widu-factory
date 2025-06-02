// src/pipeline/subsystems/context/context.subsystem.ts
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../interfaces/context.interface';
import { asyncContext } from '../../als/async-context';

@Injectable()
export class ContextSubsystem {

  setContext(ctx: RequestContext) {
    asyncContext.run(ctx, async () => {}); // noop; se establece el store
  }

  getContext(): RequestContext | undefined {
    return asyncContext.get();
  }
}
