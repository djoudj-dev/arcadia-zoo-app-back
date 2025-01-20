import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class TrackVisitDto {
  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @IsEnum(['animal', 'habitat', 'service'])
  categoryType: string;

  @IsString()
  @IsNotEmpty()
  pageId: string;

  @IsDate()
  startTime: Date;

  @IsDate()
  @IsOptional()
  endTime?: Date;

  @IsNumber()
  @IsOptional()
  duration?: number;
}
