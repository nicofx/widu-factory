// src/crud-magic/plugins/metrics/metrics.module.ts
import { Module } from '@nestjs/common';
import { MetricsService } from '../../services/metrics.service';

@Module({
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
