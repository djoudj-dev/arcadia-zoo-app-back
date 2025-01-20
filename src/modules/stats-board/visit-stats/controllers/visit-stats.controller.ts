import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TrackVisitDto } from '../dto/track-visit.dto';
import { VisitStatsService } from '../services/visit-stats.service';

@Controller('api/visits')
@UseGuards(JwtAuthGuard)
export class VisitStatsController {
  constructor(private readonly visitStatsService: VisitStatsService) {}

  @Post('track')
  async trackVisit(@Body() trackVisitDto: TrackVisitDto) {
    return this.visitStatsService.trackVisit(trackVisitDto);
  }

  @Get('stats')
  async getAllStats() {
    return this.visitStatsService.getAllStats();
  }

  @Get('stats/category/:categoryType')
  async getStatsByCategory(@Param('categoryType') categoryType: string) {
    return this.visitStatsService.getStatsByCategory(categoryType);
  }

  @Get('stats/range')
  async getStatsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.visitStatsService.getStatsByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
