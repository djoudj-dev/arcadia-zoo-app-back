import { Module } from '@nestjs/common';
import { HabitatController } from './controllers/habitat.controller';
import { HabitatService } from './services/habitat.service';

/**
 * Module de gestion des habitats.
 * Ce module regroupe les composants nécessaires pour les opérations
 * CRUD sur les habitats, incluant le contrôleur et le service associés.
 */
@Module({
  imports: [],
  controllers: [HabitatController],
  providers: [HabitatService],
  exports: [HabitatService],
})
export class HabitatModule {}
