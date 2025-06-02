// src/pipeline/steps/token-parser.step.ts
import { PipelinePhase } from '../interfaces/pipeline-step.interface';
import { ContextSubsystem } from '../subsystems/context/context.subsystem';
import { StepDefinition } from '../decorators/step-definition.decorator';
import { BaseGenericStep } from './base-step';
import * as jwt from 'jsonwebtoken';

@StepDefinition({
  name: 'TokenParserStep',
  phase: PipelinePhase.PRE,
  injects: ['ContextSubsystem'],
})
export class TokenParserStep extends BaseGenericStep {
  // Si falla la verificación del token, detenemos el pipeline
  config = { onError: 'stop' as const };

  constructor(ctx: ContextSubsystem) {
    super(ctx);
  }

  getName(): string {
    return 'TokenParserStep';
  }

  getPhase(): PipelinePhase {
    return PipelinePhase.PRE;
  }

  public async execute(requestId: string): Promise<void> {
    const context = this.ctx.getContext(requestId)!;

    // 1) Obtener header Authorization
    const authHeader = context.headers['authorization'] as string | undefined;
    if (!authHeader) {
      // No hay token: dejamos context.user como null y continuamos
      context.user = null;
      await super.execute(requestId);
      return;
    }

    // 2) Debe tener formato "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      throw new Error('[TokenParserStep] Formato de Authorization inválido. Debe ser "Bearer <token>".');
    }
    const token = parts[1];

    // 3) Intentar verificar si existe JWT_SECRET
    const secret = process.env.JWT_SECRET;
    if (secret) {
      try {
        const payload = jwt.verify(token, secret);
        context.user = payload;
        context.meta.tokenPayload = payload;
      } catch (err: any) {
        throw new Error(`[TokenParserStep] JWT inválido o expirado: ${err.message}`);
      }
    } else {
      // Si no hay secreto, hacemos decode “sin verificar” (ojo: no es seguro en prod)
      const payload = jwt.decode(token);
      context.user = payload as any;
      context.meta.tokenPayload = payload;
    }

    // 4) Registramos log de éxito
    await super.execute(requestId);
  }
}
