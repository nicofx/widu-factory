// apps/api-core/src/common/audit/audit.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true })
  tenantId!: string;

  @Prop({ required: true })
  userId!: string; // quién hizo la acción

  @Prop({ required: true })
  action!: string; // e.g. 'create:user', 'update:role'

  @Prop({ required: true })
  resourceType!: string; // 'User', 'Role', 'Permission', 'Plan'

  @Prop({ required: true })
  resourceId!: string; // ObjectId o identificador del recurso

  @Prop({ type: Object, default: {} })
  metadata: any; // { before: {...}, after: {...} }
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// ÍNDICE para búsquedas por tenant+user+fecha
AuditLogSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
