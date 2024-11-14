import { Module } from '@nestjs/common';
import { CountResourceController } from './controllers/count-resource.controller';
import { CountResourceService } from './services/count-resource.service';

/**
 * Module de gestion des ressources comptabilisées.
 * Ce module regroupe les composants nécessaires pour les opérations CRUD
 * sur les ressources comptabilisées, incluant le contrôleur et le service associés.
 */
@Module({
  controllers: [CountResourceController],
  providers: [CountResourceService],
  exports: [CountResourceService],
})
export class CountResourceModule {}
