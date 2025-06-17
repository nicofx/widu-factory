// apps/api-core/src/modules/tenants/schemas/tenant.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Tenant extends Document {
  // Guardamos el “identificador legible” en un campo distinto a _id:
  @Prop({ required: true, unique: true })
  tenantId!: string;

  @Prop({ required: true })
  name!: string;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

// Creamos un índice único sobre tenantId
TenantSchema.index({ tenantId: 1 }, { unique: true });
