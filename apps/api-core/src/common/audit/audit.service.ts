// apps/api-core/src/common/audit/audit.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog } from './audit.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private readonly auditModel: Model<AuditLog>,
  ) {}

  /**
   * Registra una entrada de auditoría.
   * @param tenantId 
   * @param userId 
   * @param action 
   * @param resourceType 
   * @param resourceId 
   * @param metadata 
   */
  async log(
    tenantId: string,
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: any = {},
  ) {
    const entry = new this.auditModel({
      tenantId,
      userId,
      action,
      resourceType,
      resourceId,
      metadata,
    });
    await entry.save();
  }

  /**
   * Listar audit logs con paginación y filtro opcional.
   */
  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    filter: Partial<{ action: string; resourceType: string; userId: string }> = {},
  ): Promise<{ data: AuditLog[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = { tenantId, ...filter };
    const [data, total] = await Promise.all([
      this.auditModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.auditModel.countDocuments(query).exec(),
    ]);
    return { data, total };
  }
}
