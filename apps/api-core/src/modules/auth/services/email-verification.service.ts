// apps/api-core/src/modules/auth/services/email-verification.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EmailVerification } from '../schemas/email-verification.schema';
import { Model } from 'mongoose';
import { createHash } from 'crypto';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectModel(EmailVerification.name)
    private readonly evModel: Model<EmailVerification>
  ) {}
  
  static hashToken(token: string): string {
    // Hasheo SHA256 del token (mejor que guardar el token en claro)
    return createHash('sha256').update(token).digest('hex');
  }
  
  async create(params: {
    userId: string;
    tenantId: string;
    email: string;
    token: string;
    expiresAt: Date;
  }): Promise<EmailVerification> {
    // Si hay tokens viejos activos, marcarlos como usados
    await this.evModel.updateMany(
      { userId: params.userId, tenantId: params.tenantId, used: false },
      { used: true }
    );
    // Insertar nuevo registro
    return this.evModel.create({
      userId: params.userId,
      tenantId: params.tenantId,
      tokenHash: EmailVerificationService.hashToken(params.token),
      expiresAt: params.expiresAt,
      email: params.email,
    });
  }
  
  async validateAndUse(params: { token: string; tenantId: string; userId: string }): Promise<boolean> {
    const hash = EmailVerificationService.hashToken(params.token);
    const now = new Date();
    const doc = await this.evModel.findOneAndUpdate(
      {
        userId: params.userId,
        tenantId: params.tenantId,
        tokenHash: hash,
        used: false,
        expiresAt: { $gt: now }
      },
      { used: true }
    );
    return !!doc;
  }
  
  async verifyAndMarkTokenUsed(token: string): Promise<EmailVerification> {
    const now = new Date();
    const tokenHash = EmailVerificationService.hashToken(token);
    const result = await this.evModel.findOneAndUpdate(
      {
        tokenHash, // 👈🏼 buscamos por hash, no token plano!
        expiresAt: { $gt: now },
        used: { $ne: true },
      },
      { $set: { used: true, usedAt: now } },
      { new: true },
    );
    if (!result) {
      throw new BadRequestException('Token inválido, expirado o ya utilizado');
    }
    return result;
  }
  
  
  
}
