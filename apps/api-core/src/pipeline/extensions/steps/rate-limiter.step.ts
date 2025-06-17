// src/pipeline/steps/rate-limiter.step.ts
import { ContextSubsystem } from '../../core/subsystems/context/context.subsystem';
import { StepDefinition } from '../../decorators/step-definition.decorator';
import { PipelinePhase } from '../../interfaces/pipeline-step.interface';
import { BaseGenericStep } from './base-step';

@StepDefinition({
  name: 'RateLimiterStep',
  phase: PipelinePhase.PRE,
  injects: ['ContextSubsystem'],
})
export class RateLimiterStep extends BaseGenericStep {
  // Detener el pipeline si supera el límite
  config = { onError: 'stop' as const };

  // Mapa estático: key = identificador (IP o tenant), value = array de timestamps (ms)
  private static requestsMap: Map<string, number[]> = new Map();

  private readonly WINDOW_MS = 60_000; // 1 minuto
  private readonly MAX_REQUESTS = 10; // máximo 10 requests por ventana

  constructor(ctx: ContextSubsystem) {
    super(ctx);
  }

  getName(): string {
    return 'RateLimiterStep';
  }

  getPhase(): PipelinePhase {
    return PipelinePhase.PRE;
  }

  public async execute(): Promise<void> {
    const context = this.ctx.getContext()!;

    // 1) Determinar “identificador” de rate-limiting: primero IP, luego tenant, sino "global"
    let key: string = 'global';
    if (context.headers['x-forwarded-for']) {
      // usar primera IP de x-forwarded-for
      key = String(context.headers['x-forwarded-for']).split(',')[0].trim();
    } else if (context.meta.tenant) {
      key = String(context.meta.tenant);
    }

    // 2) Obtener timestamps viejos y filtrar solo los de la “ventana” actual
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;
    const timestamps = RateLimiterStep.requestsMap.get(key) || [];
    const filtered = timestamps.filter((ts) => ts >= windowStart);

    // 3) Verificar si ya excede
    if (filtered.length >= this.MAX_REQUESTS) {
      throw new Error(`[RateLimiterStep] Límite excedido para key="${key}" (más de ${this.MAX_REQUESTS} req/min)`);
    }

    // 4) Agregar timestamp actual y guardar en el mapa
    filtered.push(now);
    RateLimiterStep.requestsMap.set(key, filtered);

    // 5) Continuar y registrar log
    await super.execute();
  }
}
