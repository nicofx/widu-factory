// src/crud-magic/plugins/import-export/import-export.module.ts
import { Module } from '@nestjs/common';
import { ImportExportService } from '../../services/import-export.service';

@Module({
  providers: [ImportExportService],
  exports: [ImportExportService],
})
export class ImportExportModule {}
