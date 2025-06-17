// src/crud-magic/plugins/bulk-ops/bulk-ops.module.ts
import { Module } from '@nestjs/common';
import { BulkOpsService } from '../../services/bulk-ops.service';

@Module({
  providers: [BulkOpsService],
  exports: [BulkOpsService],
})
export class BulkOpsModule {}
