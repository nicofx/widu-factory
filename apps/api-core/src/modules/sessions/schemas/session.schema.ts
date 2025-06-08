// apps/api-core/src/modules/sessions/schemas/session.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ required: true })
  sessionId!: string; // UUID
  
  @Prop({ required: true })
  userId!: string;
  
  @Prop({ required: true })
  tenantId!: string;
  
  @Prop({ required: true })
  ipAddress!: string;
  
  @Prop({ default: '' })
  userAgent?: string;
  
  @Prop({ default: false })
  revoked?: boolean;
  
  @Prop()
  lastRefreshToken?: string;   // ← Guardamos el último refresh token emitido
  
  @Prop()
  rotatedAt?: Date;            // ← Fecha de la última rotación
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Índice para búsquedas
SessionSchema.index({ userId: 1, tenantId: 1, revoked: 1 });
