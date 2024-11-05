import { Controller, Get, Param } from '@nestjs/common';
import { AnimalsService } from '../services/animals.service';
import { Animal } from 'src/modules/admin-dashboard/animal-management/models/animal.model';

@Controller('/api/animals')
export class AnimalsController {
  /**
   * Injection du service AnimalsService pour la gestion des animaux.
   * @param animalsService Service de gestion des animaux.
   */
  constructor(private animalsService: AnimalsService) {}

  @Get()
  async getAllAnimals(): Promise<Animal[]> {
    return this.animalsService.getAllAnimals();
  }

  @Get(':id')
  async getAnimalById(@Param('id') id: number): Promise<Animal> {
    return this.animalsService.getAnimalById(id);
  }
}
