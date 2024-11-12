import { Injectable } from '@nestjs/common';
import { query } from '../../../config/postgres.config';
import { Animal } from '../../admin-dashboard/animal-management/models/animal.model';
import { Habitat } from '../../admin-dashboard/habitat-management/models/habitat.model';

/**
 * Service pour gérer les habitats.
 */
@Injectable()
export class HabitatsService {
  /**
   * Récupère tous les habitats.
   * @returns Une promesse qui contient un tableau d'habitats
   */
  async getAllHabitats(): Promise<Habitat[]> {
    const res = await query(`
      SELECT id_habitat, name, description, images, created_at, updated_at
      FROM habitats
    `);
    return res.rows.map((row) => this.formatHabitat(row));
  }

  /**
   * Récupère un habitat par son identifiant.
   * @param id Identifiant de l'habitat
   * @returns Une promesse qui contient un habitat
   */
  async getHabitatById(id: number): Promise<Habitat> {
    const res = await query(
      `SELECT id_habitat, name, description, images, created_at, updated_at
      FROM habitats
      WHERE id_habitat = $1`,
      [id],
    );
    return this.formatHabitat(res.rows[0]);
  }

  /**
   * Récupère les animaux d'un habitat par son identifiant.
   * @param id Identifiant de l'habitat
   * @returns Une promesse qui contient un habitat
   */
  async getHabitatAnimals(id: number): Promise<Animal[]> {
    const res = await query(
      `SELECT id_animal, name, species, habitat_id, images, characteristics, weight_range, diet, vet_note, created_at, updated_at
       FROM animals
       WHERE habitat_id = $1`,
      [id],
    );
    return res.rows.map((row) => this.formatAnimal(row));
  }

  private formatAnimal(row: any): Animal {
    return {
      id_animal: row.id_animal,
      name: row.name,
      species: row.species,
      images: row.images,
      characteristics: row.characteristics,
      weightRange: row.weight_range,
      diet: row.diet,
      habitat_id: row.habitat_id,
      vetNote: row.vet_note,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Formate les données d'un habitat pour correspondre au modèle Habitat.
   * @param row Ligne de données brute issue de la base de données
   * @returns Un objet Habitat formaté
   */
  private formatHabitat(row: any): Habitat {
    return {
      id_habitat: row.id_habitat,
      name: row.name,
      description: row.description,
      images: row.images,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
