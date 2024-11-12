import { Controller, Get, Param } from '@nestjs/common';
import { Animal } from '../../admin-dashboard/animal-management/models/animal.model';
import { Habitat } from '../../admin-dashboard/habitat-management/models/habitat.model';
import { HabitatsService } from '../services/habitats.service';

@Controller('/api/habitats')
export class HabitatsController {
  /**
   * Injection du service HabitatsService pour la gestion des habitats.
   * @param habitatsService Service de gestion des habitats.
   */
  constructor(private habitatsService: HabitatsService) {}

  @Get()
  async getAllHabitats(): Promise<Habitat[]> {
    return this.habitatsService.getAllHabitats();
  }
  @Get(':id')
  async getHabitatById(@Param('id') id: number): Promise<Habitat> {
    return this.habitatsService.getHabitatById(id);
  }
  @Get(':id/animals')
  async getHabitatAnimals(@Param('id') id: number): Promise<Animal[]> {
    return this.habitatsService.getHabitatAnimals(id);
  }
}
