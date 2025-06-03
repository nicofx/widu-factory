// apps/api-core/src/modules/permissions/schemas/permission.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Permission extends Document {
  @Prop({ required: true })
  tenantId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: '' })
  description?: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// Índice compuesto (tenantId, name) con unicidad
PermissionSchema.index({ tenantId: 1, name: 1 }, { unique: true });
