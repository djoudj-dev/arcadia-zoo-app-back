import { Module } from '@nestjs/common';
import { CountResourceController } from './controllers/count-resource.controller';
import { CountResourceService } from './services/count-resource.service';

@Module({
  controllers: [CountResourceController],
  providers: [CountResourceService],
  exports: [CountResourceService],
})
export class CountResourceModule {}
