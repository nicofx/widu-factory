// apps/api-core/src/modules/roles/schemas/role.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ required: true })
  tenantId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: [Types.ObjectId], ref: 'Permission', default: [] })
  permissions!: Types.ObjectId[];

  @Prop({ default: false })
  deleted!: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Índice para unicidad por (tenantId, name)
RoleSchema.index({ tenantId: 1, name: 1 }, { unique: true });
