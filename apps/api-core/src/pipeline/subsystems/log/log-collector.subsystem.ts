// src/pipeline/subsystems/log/log-collector.subsystem.ts
import { Injectable } from '@nestjs/common';
import { RequestContext, StepExecutionLog } from '../../interfaces/context.interface';

@Injectable()
export class LogCollectorSubsystem {
  collect(context: RequestContext, log: StepExecutionLog) {
    if (!context.meta.logs) context.meta.logs = [];
    context.meta.logs.push(log);
    console.log(
      `[LOG] (${log.phase}) [${log.step}] → ${log.status.toUpperCase()} (${log.durationMs}ms)`,
    );
  }
}
