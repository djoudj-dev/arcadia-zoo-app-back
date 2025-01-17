import { Controller, Get, Param } from '@nestjs/common';
import { Animal } from 'src/modules/dashboard/admin-dashboard/animal-management/models/animal.model';
import { AnimalsService } from '../services/animals.service';

@Controller('/animals')
export class AnimalsController {
  /**
   * Injection du service AnimalsService pour la gestion des animaux.
   * @param animalsService Service de gestion des animaux.
   */
  constructor(readonly animalsService: AnimalsService) {}

  @Get()
  async getAllAnimals(): Promise<Animal[]> {
    return this.animalsService.getAllAnimals();
  }

  @Get(':id')
  async getAnimalById(@Param('id') id: number): Promise<Animal> {
    return this.animalsService.getAnimalById(id);
  }

  private formatImageUrl(
    imageUrl: string | null,
    baseUrl: string,
  ): string | null {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('uploads/animals/'))
      return `${baseUrl}/api/${imageUrl}`;
    return `${baseUrl}/api/uploads/animals/${imageUrl}`;
  }

  private formatAnimal(row: any): Animal {
    const baseUrl = process.env.API_URL || 'https://api.nedellec-julien.fr';
    return {
      id_animal: row.id_animal,
      name: row.name,
      species: row.species,
      images: this.formatImageUrl(row.images, baseUrl),
      characteristics: row.characteristics,
      weightRange: row.weight_range,
      diet: row.diet,
      habitat_id: row.habitat_id,
      vetNote: row.vet_note,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
