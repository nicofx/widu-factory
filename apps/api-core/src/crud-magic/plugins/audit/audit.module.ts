// src/crud-magic/plugins/audit/audit.module.ts
import { Module } from '@nestjs/common';
import { AuditWrapperService } from '../../services/audit-wrapper.service';

@Module({
  providers: [AuditWrapperService],
  exports: [AuditWrapperService],
})
export class AuditPluginModule {}
