// apps/api-core/src/modules/sessions/session.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from './schemas/session.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  constructor(@InjectModel(Session.name) private readonly sessionModel: Model<Session>) {}

  /**
   * Crear nueva sesión
   */
  async createSession(
    userId: string,
    tenantId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<Session> {
    const sessionId = uuidv4();
    const newSess = new this.sessionModel({
      sessionId,
      userId,
      tenantId,
      ipAddress,
      userAgent,
      revoked: false,
    });
    return await newSess.save();
  }

  /**
   * Revocar (eliminar) sesión por sessionId
   */
  async revokeSession(tenantId: string, sessionId: string): Promise<void> {
    const result = await this.sessionModel.updateOne(
      { sessionId, tenantId },
      { revoked: true },
    );
    if (result.matchedCount === 0) {
      throw new NotFoundException('Sesión no encontrada.');
    }
  }

  /**
   * Obtener sesiones activas de un usuario
   */
  async listUserSessions(
    tenantId: string,
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Session[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter = { tenantId, userId, revoked: false };
    const [data, total] = await Promise.all([
      this.sessionModel.find(filter).skip(skip).limit(limit).exec(),
      this.sessionModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  /**
   * Verificar que la sesión está activa (no revocada). Usado en SessionGuard.
   */
  async isSessionActive(tenantId: string, sessionId: string): Promise<boolean> {
    const sess = await this.sessionModel.findOne({ tenantId, sessionId, revoked: false }).exec();
    return !!sess;
  }
}
