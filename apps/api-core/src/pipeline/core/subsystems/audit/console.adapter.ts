// src/pipeline/subsystems/audit/console.adapter.ts

import { AuditAdapter, AuditEntry } from "./audit-adapter.interface";


export class ConsoleAuditAdapter implements AuditAdapter {
  async record(data: AuditEntry): Promise<void> {
    console.log(
      `[AUDIT] ${data.event}`,
      JSON.stringify(data.payload),
      `@ ${new Date(data.timestamp).toISOString()}`,
    );
  }
}
