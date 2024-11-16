import { Module } from '@nestjs/common';
import { ServiceController } from './controllers/service.controller';
import { ServiceService } from './services/service.service';

@Module({
  imports: [],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
