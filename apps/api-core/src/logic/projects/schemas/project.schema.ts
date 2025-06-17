// apps/api-core/src/modules/projects/schemas/project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true })
  tenantId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: String, default: '' })
  description!: string;

  @Prop({ type: Boolean, default: false })
  archived!: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
