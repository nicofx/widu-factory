// apps/api-core/src/common/guards/session.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '../../modules/sessions/session.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const payload = req.user; // Inyectado por JwtStrategy
    const { tenantId, sessionId } = payload;
    if (!sessionId) {
      throw new UnauthorizedException('Token sin sessionId.');
    }
    const active = await this.sessionService.isSessionActive(tenantId, sessionId);
    if (!active) {
      throw new UnauthorizedException('Sesión revocada o expirada.');
    }
    return true;
  }
}
