// crud-magic/src/interfaces/metrics.interface.ts

/**
 * MetricsInterface
 *
 * - incrementCounter: sumar 1 a un contador específico (ej. 'products.findAll')
 * - recordLatency: registrar latencia de un endpoint en milisegundos
 * - getMetrics: devolver un objeto con métricas acumuladas
 */
export interface MetricsInterface {
  incrementCounter(metricName: string): void;
  recordLatency(metricName: string, ms: number): void;
  getMetrics(): Record<string, any>;
}
