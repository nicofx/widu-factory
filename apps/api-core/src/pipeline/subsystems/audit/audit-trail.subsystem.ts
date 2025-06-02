// src/pipeline/subsystems/audit/audit-trail.subsystem.ts
import { Injectable } from '@nestjs/common';
import { ConsoleAuditAdapter } from './console.adapter';
import { AuditAdapter, AuditEntry } from './audit-adapter.interface';

@Injectable()
export class AuditTrailSubsystem {
  private adapters: AuditAdapter[] = [new ConsoleAuditAdapter()];

  async logEvent(event: string, payload: any) {
    const entry: AuditEntry = {
      event,
      payload,
      timestamp: Date.now(),
    };
    for (const adapter of this.adapters) {
      await adapter.record(entry);
    }
  }

  addAdapter(adapter: AuditAdapter) {
    this.adapters.push(adapter);
  }
}
