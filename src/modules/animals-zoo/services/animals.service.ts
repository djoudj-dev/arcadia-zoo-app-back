import { Injectable } from '@nestjs/common';
import { query } from '../../../config/postgres.config';
import { Animal } from '../../dashboard/admin-dashboard/animal-management/models/animal.model';

@Injectable()
export class AnimalsService {
  /**
   * Récupère la liste de tous les animaux.
   */
  async getAllAnimals(): Promise<Animal[]> {
    const res = await query(
      `/* PostgreSQL */
      SELECT id_animal, name, species, habitat_id, images, characteristics, weight_range, diet, vet_note, created_at, updated_at
      FROM animals`,
    );
    return res.rows.map((row) => this.formatAnimal(row));
  }

  async getAnimalById(id: number): Promise<Animal> {
    const res = await query(
      `/* PostgreSQL */
      SELECT id_animal, name, species, habitat_id, images, characteristics, weight_range, diet, vet_note, created_at, updated_at
      FROM animals
      WHERE id_animal = $1`,
      [id],
    );
    return this.formatAnimal(res.rows[0]);
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
    const baseUrl = process.env.API_URL || 'https://arcadia-api.nedellec-julien.fr';
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
