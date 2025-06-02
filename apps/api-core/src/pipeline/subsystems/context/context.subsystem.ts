// src/pipeline/subsystems/context/context.subsystem.ts
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../interfaces/context.interface';

@Injectable()
export class ContextSubsystem {
  private contextMap = new Map<string, RequestContext>();

  public setContext(context: RequestContext): void {
    this.contextMap.set(context.requestId, context);
  }

  public getContext(requestId: string): RequestContext | undefined {
    return this.contextMap.get(requestId);
  }

  public deleteContext(requestId: string): void {
    this.contextMap.delete(requestId);
  }
}
