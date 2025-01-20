import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VisitStatsDocument = VisitStats & Document;

@Schema({ timestamps: true })
export class VisitStats {
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

  @Prop({ default: 0 })
  visit_count: number;

  @Prop({ default: 0 })
  visit_percentage: number;

  @Prop({ default: 0 })
  total_duration: number;

  @Prop({ default: 0 })
  average_duration: number;

  @Prop()
  last_visit: Date;
}

export const VisitStatsSchema = SchemaFactory.createForClass(VisitStats);
