// apps/api-core/src/modules/auth/schemas/email-verification.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EmailVerification extends Document {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  tenantId!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  tokenHash!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ default: false })
  used!: boolean;

  @Prop()
  usedAt?: Date;
}

export const EmailVerificationSchema = SchemaFactory.createForClass(EmailVerification);
