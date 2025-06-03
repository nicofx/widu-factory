// apps/api-core/src/modules/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  tenantId!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ type: [Types.ObjectId], ref: 'Role', default: [] })
  roles!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Plan', default: null })
  plan!: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  metadata!: {
    name?: string;
    phone?: string;
    avatarUrl?: string;
    [key: string]: any;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Índices para búsquedas de HACL
UserSchema.index({ tenantId: 1, roles: 1 });
UserSchema.index({ tenantId: 1, plan: 1 });

// Índice compuesto para (tenantId, email) con unicidad
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });