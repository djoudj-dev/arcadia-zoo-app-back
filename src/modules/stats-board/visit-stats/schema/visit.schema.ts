import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VisitDocument = Visit & Document;

@Schema({ timestamps: true })
export class Visit {
  @Prop({ required: true })
  categoryName: string;

  @Prop({ required: true, enum: ['animal', 'habitat', 'service'] })
  categoryType: string;

  @Prop({ required: true })
  pageId: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime?: Date;

  @Prop()
  duration?: number;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
