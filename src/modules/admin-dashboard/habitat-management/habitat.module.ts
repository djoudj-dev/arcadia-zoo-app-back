import { Module } from '@nestjs/common';
import { HabitatController } from './controllers/habitat.controller';
import { HabitatService } from './services/habitat.service';

@Module({
  imports: [],
  controllers: [HabitatController],
  providers: [HabitatService],
  exports: [HabitatService],
})
export class HabitatModule {}
