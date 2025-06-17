// apps/api-core/src/modules/sessions/session.service.ts

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from './schemas/session.schema';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  
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
    const secret = this.configService.get<string>('JWT_SECRET');
    const refreshToken = this.jwtService.sign(
      { sid: sessionId, tenantId, userId },
      { expiresIn: '30d', secret },
    );
    const session = new this.sessionModel({
      sessionId,
      userId,
      tenantId,
      ipAddress,
      userAgent,
      lastRefreshToken: refreshToken,
      rotatedAt: new Date(),
    });
    await session.save();
    
    // ⬇️ Limitar sesiones activas después de guardar la nueva
    const maxSessions = parseInt(this.configService.get('MAX_ACTIVE_SESSIONS') ?? '5', 10); // default 5
    await this.limitActiveSessions(tenantId, userId, maxSessions);
    
    return session;
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
  
  /**
  * Stub Rotate.
  */
  // 🔥 PATCH rotateToken
  async rotateToken(
    refreshToken: string,
    jwtService: JwtService,
    secret: string,
    usersService: UsersService,
  ): Promise<{
    session: Session;
    newRefreshToken: string;
    user: { email: string; roles: string[] };
  }> {
    // 1. Verificar firma y payload
    let payload: any;
    try {
      payload = jwtService.verify(refreshToken, { secret });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado.');
    }
    
    // 2. Buscar sesión activa
    const sess = await this.sessionModel.findOne({
      sessionId: payload.sid,
      tenantId: payload.tenantId,
      revoked: false,
    });
    if (!sess) throw new UnauthorizedException('Sesión revocada o inexistente.');
    
    // 3. Chequear si el refresh token coincide con el último emitido
    if (sess.lastRefreshToken && sess.lastRefreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token ya usado (replay detected).');
    }
    
    // 4. Generar nuevo refresh token
    const newRefreshToken = jwtService.sign(
      { sid: sess.sessionId, tenantId: sess.tenantId, userId: sess.userId },
      { expiresIn: '30d', secret },
    );
    
    // 5. Guardar el nuevo refresh token y fecha de rotación
    sess.lastRefreshToken = newRefreshToken;
    sess.rotatedAt = new Date();
    await sess.save();
    
    // 6. Traer usuario actualizado
    const userDoc = await usersService.findOneRaw(sess.tenantId, sess.userId);
    if (!userDoc) throw new NotFoundException('Usuario no encontrado.');
    const roles = userDoc.roles.map((r: any) => r.toString());
    
    return {
      session: sess,
      newRefreshToken,
      user: { email: userDoc.email, roles },
    };
  }
  
  /** Listar sesiones activas */
  async listSessions(tenantId: string, userId: string) {
    const data = await this.sessionModel.find({ tenantId, userId, revoked: false }).sort({ createdAt: -1 }).lean();
    const total = data.length;
    return { data, total };
  }
  
  /** Revocar una sesión específica (propia) */
  async revokeSessionById(tenantId: string, userId: string, sessionId: string) {
    const session = await this.sessionModel.findOne({ tenantId, userId, sessionId });
    if (!session) throw new NotFoundException('Sesión no encontrada.');
    if (session.revoked) return;
    session.revoked = true;
    await session.save();
  }
  
  /** Revocar TODAS las sesiones del usuario (excepto la actual) */
  async revokeAllSessionsExcept(tenantId: string, userId: string, exceptSessionId: string) {
    await this.sessionModel.updateMany(
      { tenantId, userId, revoked: false, sessionId: { $ne: exceptSessionId } },
      { $set: { revoked: true } }
    );
  }
  
  /** Limitar sesiones activas: máximo N */
  async limitActiveSessions(tenantId: string, userId: string, maxSessions: number) {
    const sessions = await this.sessionModel
    .find({ tenantId, userId, revoked: false })
    .sort({ createdAt: 1 }); // más antiguas primero
    
    if (sessions.length > maxSessions) {
      const toRevoke = sessions.slice(0, sessions.length - maxSessions);
      await this.sessionModel.updateMany(
        { _id: { $in: toRevoke.map((s) => s._id) } },
        { $set: { revoked: true } }
      );
    }
  }
  
  /** [Opcional] Cleanup: borra sesiones viejas/revocadas (llamalo con cron o manual) */
  async cleanupOldSessions(days: number = 30) {
    const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    await this.sessionModel.deleteMany({
      $or: [
        { revoked: true, updatedAt: { $lt: threshold } },
        { createdAt: { $lt: threshold } },
      ]
    });
  }
  
  
}
