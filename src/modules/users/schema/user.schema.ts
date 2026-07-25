import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {

  @Prop({ required: true })
  full_name: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop()
  phone: string

  @Prop()
  role: string

  @Prop({ type: [String], default: [] })
  addresses: string[]

  @Prop({ type: Date, default: null })
  deletedAt: Date | null

}

export const UserSchema = SchemaFactory.createForClass(User);
