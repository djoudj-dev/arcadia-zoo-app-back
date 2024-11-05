import { Module } from '@nestjs/common';
import { HabitatsController } from './controllers/habitats.controller';
import { HabitatsService } from './services/habitats.service';

/**
 * Module de gestion des habitats.
 * Ce module regroupe les composants nécessaires pour les opérations CRUD
 * sur les habitats, incluant le contrôleur et le service associés.
 */
@Module({
  imports: [],
  controllers: [HabitatsController], // Déclare les contrôleurs
  providers: [HabitatsService], // Déclare les services
  exports: [HabitatsService], // Exporte les services pour une utilisation dans d'autres modules
})
export class HabitatsModule {}
