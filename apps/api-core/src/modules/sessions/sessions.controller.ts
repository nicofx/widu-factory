import {
  Controller, Get, Delete, Param, UseGuards, Post,
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Query
} from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Authenticated } from '../../common/decorators/authenticated.decorator';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionService: SessionService) {}


  /** Listar sesiones activas propias */
  @Get()
  async listSessions(@Request() req: any) {
    const { userId, tenantId } = req.user;
    return await this.sessionService.listSessions(tenantId, userId);
  }

  /** Revocar UNA sesión (no la actual si no querés) */
  @Delete(':sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(@Request() req: any, @Param('sessionId') sessionId: string) {
    const { userId, tenantId, sessionId: currentSessionId } = req.user;
    // Evita borrar la sesión actual si querés
    if (sessionId === currentSessionId) {
      throw new ForbiddenException('No puedes revocar tu sesión actual desde aquí.');
    }
    await this.sessionService.revokeSessionById(tenantId, userId, sessionId);
    return;
  }

  /** Revocar TODAS las sesiones del usuario (excepto la actual) */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeAll(@Request() req: any, @Query('all') all: string) {
    if (all !== 'true') {
      throw new ForbiddenException('Para revocar todas, pasá ?all=true');
    }
    const { userId, tenantId, sessionId: currentSessionId } = req.user;
    await this.sessionService.revokeAllSessionsExcept(tenantId, userId, currentSessionId);
    return;
  }
}
