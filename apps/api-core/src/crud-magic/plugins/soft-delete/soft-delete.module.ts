// src/crud-magic/plugins/soft-delete/soft-delete.module.ts
import { Module } from '@nestjs/common';
import { SoftDeleteService } from '../../services/soft-delete.service';

@Module({
  providers: [SoftDeleteService],
  exports: [SoftDeleteService],
})
export class SoftDeleteModule {}
