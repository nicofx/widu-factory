// src/pipeline/subsystems/error-manager/error-manager.subsystem.ts
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../interfaces/context.interface';

@Injectable()
export class ErrorManagerSubsystem {
  async handle(error: any, context: RequestContext, stepName: string) {
    context.errors ??= [];
    context.errors.push({
      step: stepName,
      message: error.message || 'Unknown error',
      timestamp: Date.now(),
    });
    console.error(`[ERROR][${stepName}]`, error);
  }
}
