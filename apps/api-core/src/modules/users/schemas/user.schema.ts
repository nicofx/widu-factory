import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email!: string;
  
  @Prop({ required: true })
  password!: string;
  
  @Prop({ required: true })
  role!: string;
  
  @Prop({ required: true })
  tenant!: string;
  
  @Prop({ default: 'default' }) // 👈 ya preparado para que sea opcional
  plan?: string;
  
  @Prop({ default: 'jwt' }) // 👈 agregamos esta línea
  strategy?: string;
  
  @Prop({ default: false })
  confirmed!: boolean;
}

export type UserDocument = Document<unknown, {}, User> & User & { _id: Types.ObjectId };

export const UserSchema = SchemaFactory.createForClass(User);
