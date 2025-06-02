// src/pipeline/subsystems/audit/audit-adapter.interface.ts
export interface AuditEntry {
  event: string;
  payload: any;
  timestamp: number;
}

export interface AuditAdapter {
  record(data: AuditEntry): Promise<void>;
}
