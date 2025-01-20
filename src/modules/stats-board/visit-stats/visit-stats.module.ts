import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnimalsModule } from 'src/modules/animals-zoo/animals.module';
import { HabitatsModule } from 'src/modules/habitats-zoo/habitats.module';
import { ServicesModule } from 'src/modules/services-zoo/services.module';
import { CountResourceModule } from '../counts-resource/count-resource.module';
import { VisitStatsController } from './controllers/visit-stats.controller';
import { VisitStats, VisitStatsSchema } from './schema/visit-stats.schema';
import { VisitStatsService } from './services/visit-stats.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VisitStats.name, schema: VisitStatsSchema },
    ]),
    HttpModule,
    CountResourceModule,
    AnimalsModule,
    HabitatsModule,
    ServicesModule,
  ],
  controllers: [VisitStatsController],
  providers: [VisitStatsService],
  exports: [VisitStatsService],
})
export class VisitStatsModule {}
