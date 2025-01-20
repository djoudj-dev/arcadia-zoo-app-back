import { Module } from '@nestjs/common';
import { CountResourceModule } from './counts-resource/count-resource.module';
import { VisitStatsModule } from './visit-stats/visit-stats.module';

@Module({
  imports: [VisitStatsModule, CountResourceModule],
  exports: [VisitStatsModule, CountResourceModule],
})
export class StatsBoardModule {}
