// crud-magic/src/services/metrics.service.ts

import { Injectable } from '@nestjs/common';

/**
 * MetricsService
 *
 * - incrementCounter(metricName: string): void
 * - recordLatency(metricName: string, ms: number): void
 * - getMetrics(): Record<string, any>
 *
 * Sprint 6: implementar con un objeto en memoria o exponer un endpoint `/metrics`.
 */
@Injectable()
export class MetricsService {
  incrementCounter(metricName: string): void {
    throw new Error('MetricsService.incrementCounter: not implemented');
  }

  recordLatency(metricName: string, ms: number): void {
    throw new Error('MetricsService.recordLatency: not implemented');
  }

  getMetrics(): Record<string, any> {
    throw new Error('MetricsService.getMetrics: not implemented');
  }
}
