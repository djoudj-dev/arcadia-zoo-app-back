import { Module } from '@nestjs/common';
import { AnimalsController } from './controllers/animals.controller';
import { AnimalsService } from './services/animals.service';
@Module({
  imports: [],
  controllers: [AnimalsController],
  providers: [AnimalsService],
  exports: [AnimalsService],
})
export class AnimalsModule {}
