// apps/api-core/src/modules/files/schemas/file.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class FileMeta extends Document {
  @Prop({ required: true })
  tenantId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  bucketKey!: string; // e.g. 'tenant/user/uuid.jpg'

  @Prop({ required: true })
  url!: string; // URL pública o pre-signed

  @Prop({ required: true })
  contentType!: string;
}

export const FileMetaSchema = SchemaFactory.createForClass(FileMeta);
