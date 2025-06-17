// src/crud-magic/plugins/filtering/filtering.module.ts
import { Module } from '@nestjs/common';
import { FilteringService } from '../../services/filtering.service';

@Module({
  providers: [FilteringService],
  exports: [FilteringService],
})
export class FilteringModule {}
