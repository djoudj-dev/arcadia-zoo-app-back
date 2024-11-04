import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { query } from '../../../../config/postgres.config';
import { Habitat } from '../models/habitat.model';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class HabitatService {
  async getAllHabitats(): Promise<Habitat[]> {
    const res = await query(`
      SELECT id_habitat, name, description, images, created_at, updated_at
      FROM habitats
    `);
    return res.rows.map((row) => this.formatHabitat(row));
  }

  async createHabitat(
    habitatData: Partial<Habitat>,
    userRole: string,
  ): Promise<Habitat> {
    console.log("Début de la création de l'habitat");
    this.checkAdminRole(userRole);
    console.log("Rôle de l'utilisateur vérifié:", userRole);

    const { name, description, images } = habitatData;
    console.log("Données de l'habitat reçues:", habitatData);

    if (!name || !description || !images) {
      console.error(
        'Les champs "name", "description" et "images" sont requis.',
      );
      throw new BadRequestException(
        'Les champs "name", "description" et "images" sont requis.',
      );
    }

    try {
      const res = await query(
        `INSERT INTO habitats (name, description, images, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [name, description, images],
      );
      console.log('Habitat créé avec succès:', res.rows[0]);
      return this.formatHabitat(res.rows[0]);
    } catch (error) {
      console.error("Erreur lors de la création de l'habitat:", error);
      throw new Error("Erreur lors de la création de l'habitat");
    }
  }

  async updateHabitat(
    id: number,
    habitatData: Partial<Habitat>,
    userRole: string,
  ): Promise<Habitat> {
    this.checkAdminRole(userRole);
    const existingHabitat = await this.findOne(id);
    if (!existingHabitat) {
      throw new NotFoundException(`Habitat avec l'ID ${id} non trouvé`);
    }

    const { name, description, images } = habitatData;

    const res = await query(
      `UPDATE habitats SET 
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         images = COALESCE($3, images),
         updated_at = NOW()
       WHERE id_habitat = $4 RETURNING *`,
      [name, description, images, id],
    );

    return this.formatHabitat(res.rows[0]);
  }

  async deleteHabitat(
    id: number,
    userRole: string,
  ): Promise<{ message: string }> {
    this.checkAdminRole(userRole);
    const existingHabitat = await this.findOne(id);
    if (!existingHabitat) {
      throw new NotFoundException(`Habitat avec l'ID ${id} non trouvé`);
    }

    // Supprimer l'image associée
    const imagePath = path.join(process.cwd(), existingHabitat.images);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await query('DELETE FROM habitats WHERE id_habitat = $1', [id]);
    return { message: `Habitat avec l'ID ${id} supprimé avec succès` };
  }

  async findOne(id: number): Promise<Habitat | null> {
    const res = await query('SELECT * FROM habitats WHERE id_habitat = $1', [
      id,
    ]);
    if (res.rows.length === 0) {
      return null;
    }
    return this.formatHabitat(res.rows[0]);
  }

  private checkAdminRole(userRole: string): void {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can perform this action');
    }
  }

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
