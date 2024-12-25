// Backend: AnimalService
import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { query } from '../../../../../config/postgres.config';
import { Animal } from '../models/animal.model';

@Injectable()
export class AnimalService {
  async getAllAnimals(): Promise<Animal[]> {
    const res = await query('SELECT * FROM animals');
    return res.rows.map((row) => this.formatAnimal(row));
  }

  async findOne(id: number): Promise<Animal | null> {
    const res = await query('SELECT * FROM animals WHERE id_animal = $1', [id]);
    return res.rows[0] ? this.formatAnimal(res.rows[0]) : null;
  }

  async createAnimal(
    animalData: Partial<Animal>,
    userRole: string,
  ): Promise<Animal> {
    this.checkAdminRole(userRole);

    const {
      name,
      species,
      characteristics,
      weightRange,
      diet,
      habitat_id,
      images,
      vetNote,
    } = animalData;
    if (
      !name ||
      !species ||
      !characteristics ||
      !weightRange ||
      !diet ||
      !habitat_id ||
      !images
    ) {
      throw new BadRequestException(
        'Tous les champs obligatoires doivent être remplis.',
      );
    }

    const res = await query(
      `INSERT INTO animals (name, species, characteristics, weight_range, diet, habitat_id, images, vet_note, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *`,
      [
        name,
        species,
        characteristics,
        weightRange,
        diet,
        habitat_id,
        images,
        vetNote || null,
      ],
    );
    return this.formatAnimal(res.rows[0]);
  }

  async updateAnimal(
    id: number,
    animalData: Partial<Animal>,
    userRole: string,
  ): Promise<Animal> {
    this.checkAdminRole(userRole);
    console.log('=== DÉBUT UPDATE ANIMAL SERVICE ===');
    console.log(
      '1. Données reçues brutes:',
      JSON.stringify(animalData, null, 2),
    );

    const existingAnimal = await this.findOne(id);
    console.log('2. Animal existant:', JSON.stringify(existingAnimal, null, 2));

    if (!existingAnimal) {
      throw new BadRequestException(`Animal avec l'ID ${id} non trouvé`);
    }

    // Préparation des données avec vérification explicite et logs
    const updateData = {
      name: animalData.name || existingAnimal.name,
      species: animalData.species || existingAnimal.species,
      characteristics:
        animalData.characteristics || existingAnimal.characteristics,
      weight_range: animalData.weightRange || existingAnimal.weightRange,
      diet: animalData.diet || existingAnimal.diet,
      habitat_id: animalData.habitat_id || existingAnimal.habitat_id,
      images: animalData.images || existingAnimal.images,
      vet_note: animalData.vetNote || existingAnimal.vetNote,
    };

    console.log(
      '3. Données préparées pour update:',
      JSON.stringify(updateData, null, 2),
    );
    console.log('4. Requête SQL qui va être exécutée avec les paramètres:', [
      updateData.name,
      updateData.species,
      updateData.characteristics,
      updateData.weight_range,
      updateData.diet,
      updateData.habitat_id,
      updateData.images,
      updateData.vet_note,
      id,
    ]);

    const res = await query(
      `UPDATE animals SET 
        name = $1,
        species = $2,
        characteristics = $3,
        weight_range = $4,
        diet = $5,
        habitat_id = $6,
        images = $7,
        vet_note = $8,
        updated_at = NOW()
      WHERE id_animal = $9 RETURNING *;`,
      [
        updateData.name,
        updateData.species,
        updateData.characteristics,
        updateData.weight_range,
        updateData.diet,
        updateData.habitat_id,
        updateData.images,
        updateData.vet_note,
        id,
      ],
    );

    console.log(
      '5. Résultat de la requête:',
      JSON.stringify(res.rows[0], null, 2),
    );
    return this.formatAnimal(res.rows[0]);
  }

  async deleteAnimal(id: number, userRole: string): Promise<Animal> {
    this.checkAdminRole(userRole);
    const existingAnimal = await this.findOne(id);
    if (!existingAnimal) {
      throw new BadRequestException(`Animal avec l'ID ${id} non trouvé`);
    }

    const imagePath = path.join(process.cwd(), existingAnimal.images);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await query('DELETE FROM animals WHERE id_animal = $1', [id]);
    return existingAnimal;
  }

  private checkAdminRole(userRole: string): void {
    if (userRole !== 'admin') {
      throw new BadRequestException('Permissions insuffisantes.');
    }
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
}
