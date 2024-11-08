import { Module } from '@nestjs/common';
import { ServicesController } from './controllers/services.controller';
import { ServicesService } from './services/services.service';

/**
 * Module de gestion des services.
 * Ce module regroupe les composants nécessaires pour les opérations CRUD
 * sur les services, incluant le contrôleur et le service associés.
 */
@Module({
  imports: [],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
