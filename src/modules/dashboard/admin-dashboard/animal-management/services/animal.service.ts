// Backend: AnimalService
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { query } from '../../../../../config/postgres.config';
import { Animal } from '../models/animal.model';

@Injectable()
export class AnimalService {
  async getAllAnimals(): Promise<Animal[]> {
    const res = await query('/* PostgreSQL */ SELECT * FROM animals');
    return res.rows.map((row: Animal) => this.formatAnimal(row));
  }

  async findOne(id: number): Promise<Animal | null> {
    const res = await query('/* PostgreSQL */ SELECT * FROM animals WHERE id_animal = $1', [id]);
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
      `/* PostgreSQL */
      INSERT INTO animals (name, species, characteristics, weight_range, diet, habitat_id, images, vet_note, created_at, updated_at) 
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
    const existingAnimal = await this.findOne(id);
    if (!existingAnimal) {
      throw new NotFoundException(`Animal avec l'ID ${id} non trouvé`);
    }

    // Gestion de l'image
    if (animalData.images) {
      // Si c'est une nouvelle image (contient le nom du fichier généré par multer)
      if (
        typeof animalData.images === 'string' &&
        animalData.images.includes('-')
      ) {
        // On stocke uniquement le chemin relatif
        animalData.images = `uploads/animals/${animalData.images}`;
      } else if (animalData.images.startsWith('http')) {
        // Si c'est une URL complète, on extrait le chemin relatif
        const urlParts = animalData.images.split('/api/');
        animalData.images = urlParts[1] || existingAnimal.images;
      } else {
        animalData.images = existingAnimal.images;
      }
    }

    const res = await query(
      `/* PostgreSQL */
      UPDATE animals SET 
        name = COALESCE($1, name),
        species = COALESCE($2, species),
        characteristics = COALESCE($3, characteristics),
        weight_range = COALESCE($4, weight_range),
        diet = COALESCE($5, diet),
        habitat_id = COALESCE($6, habitat_id),
        images = COALESCE($7::text, images),
        vet_note = CASE 
          WHEN $8 = '' THEN NULL 
          ELSE COALESCE($8, vet_note)
        END,
        updated_at = NOW()
      WHERE id_animal = $9 RETURNING *`,
      [
        animalData.name,
        animalData.species,
        animalData.characteristics,
        animalData.weightRange,
        animalData.diet,
        animalData.habitat_id,
        animalData.images,
        animalData.vetNote,
        id,
      ],
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

    await query('/* PostgreSQL */ DELETE FROM animals WHERE id_animal = $1', [id]);
    return existingAnimal;
  }

  private checkAdminRole(userRole: string): void {
    if (userRole !== 'admin') {
      throw new BadRequestException('Permissions insuffisantes.');
    }
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

  private formatImageUrl(
    imageUrl: string | null,
    baseUrl: string,
  ): string | null {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${baseUrl}/api/${imageUrl}`;
  }
}
