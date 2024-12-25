// Backend: AnimalService
import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import { query } from '../../../../../config/postgres.config';
import { Animal } from '../models/animal.model';

const pool = new Pool();

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

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Vérification de l'existence de l'animal
      const existingAnimal = await this.findOne(id);
      if (!existingAnimal) {
        throw new BadRequestException(`Animal avec l'ID ${id} non trouvé`);
      }

      // Construction de la requête dynamique
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      // Mapping des champs
      const fieldMapping = {
        name: 'name',
        species: 'species',
        characteristics: 'characteristics',
        weightRange: 'weight_range',
        diet: 'diet',
        habitat_id: 'habitat_id',
        images: 'images',
        vetNote: 'vet_note',
      };

      // Construction dynamique de la requête
      for (const [key, dbField] of Object.entries(fieldMapping)) {
        if (animalData[key] !== undefined) {
          updateFields.push(`${dbField} = $${paramCount}`);
          let value = animalData[key];
          if (key === 'vetNote' && value === '') {
            value = null;
          } else if (key === 'habitat_id') {
            value = Number(value);
          }
          values.push(value);
          paramCount++;
        }
      }

      // Ajout du timestamp
      updateFields.push(`updated_at = NOW()`);

      // Construction de la requête finale
      const query = `
        UPDATE animals 
        SET ${updateFields.join(', ')}
        WHERE id_animal = $${paramCount}
        RETURNING *;
      `;

      // Ajout de l'ID à la fin des paramètres
      values.push(id);

      const res = await client.query(query, values);

      if (!res.rows[0]) {
        throw new Error('La mise à jour a échoué');
      }

      await client.query('COMMIT');
      return this.formatAnimal(res.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    } finally {
      client.release();
    }
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
