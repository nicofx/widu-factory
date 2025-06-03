// apps/api-core/src/modules/plans/schemas/plan.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Plan extends Document {
  @Prop({ required: true })
  tenantId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, default: 0 })
  price!: number;

  @Prop({ type: [String], default: [] })
  features!: string[];

  @Prop({ type: [Types.ObjectId], ref: 'Role', default: [] })
  defaultRoles!: Types.ObjectId[];
}

export const PlanSchema = SchemaFactory.createForClass(Plan);

// Índice compuesto (tenantId, name) con unicidad
PlanSchema.index({ tenantId: 1, name: 1 }, { unique: true });

// Índice para buscar planes que incluyan cierto rol en defaultRoles
PlanSchema.index({ tenantId: 1, defaultRoles: 1 });
