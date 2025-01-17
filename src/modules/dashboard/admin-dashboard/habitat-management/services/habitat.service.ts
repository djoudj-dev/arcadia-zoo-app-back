import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { query } from '../../../../../config/postgres.config';
import { Habitat } from '../models/habitat.model';

/**
 * Service pour gérer les opérations CRUD des habitats.
 */
@Injectable()
export class HabitatService {
  /**
   * Récupère tous les habitats de la base de données.
   * @returns Une promesse d'un tableau d'objets Habitat.
   */
  async getAllHabitats(): Promise<Habitat[]> {
    const res = await query(`
      SELECT id_habitat, name, description, images, created_at, updated_at
      FROM habitats
    `);
    return res.rows.map((row) => this.formatHabitat(row));
  }

  /**
   * Crée un nouvel habitat après validation des données et du rôle d'utilisateur.
   * @param habitatData Données de l'habitat partiellement remplies
   * @param userRole Rôle de l'utilisateur pour vérification des autorisations
   * @returns La promesse de l'objet Habitat créé
   * @throws BadRequestException Si des champs requis sont manquants
   */
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

  /**
   * Met à jour les informations d'un habitat existant.
   * @param id Identifiant de l'habitat à mettre à jour
   * @param habitatData Nouvelles données de l'habitat partiellement remplies
   * @param userRole Rôle de l'utilisateur pour vérification des autorisations
   * @returns La promesse de l'objet Habitat mis à jour
   * @throws NotFoundException Si l'habitat avec l'ID spécifié n'existe pas
   */
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

    // Formater le chemin de l'image si présent
    if (
      habitatData.images &&
      !habitatData.images.startsWith('uploads/habitats/')
    ) {
      habitatData.images = `uploads/habitats/${habitatData.images}`;
    }

    console.log('Données à mettre à jour:', habitatData);

    const res = await query(
      `UPDATE habitats SET 
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         images = COALESCE($3, images),
         updated_at = NOW()
       WHERE id_habitat = $4 RETURNING *`,
      [habitatData.name, habitatData.description, habitatData.images, id],
    );

    console.log('Résultat de la mise à jour:', res.rows[0]);
    return this.formatHabitat(res.rows[0]);
  }

  /**
   * Supprime un habitat spécifique, y compris l'image associée.
   * @param id Identifiant de l'habitat à supprimer
   * @param userRole Rôle de l'utilisateur pour vérification des autorisations
   * @returns Un message de confirmation de suppression
   * @throws NotFoundException Si l'habitat avec l'ID spécifié n'existe pas
   */
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

  /**
   * Récupère un habitat spécifique par son ID.
   * @param id Identifiant de l'habitat
   * @returns Une promesse de l'objet Habitat ou null s'il n'est pas trouvé
   */
  async findOne(id: number): Promise<Habitat | null> {
    const res = await query('SELECT * FROM habitats WHERE id_habitat = $1', [
      id,
    ]);
    if (res.rows.length === 0) {
      return null;
    }
    return this.formatHabitat(res.rows[0]);
  }

  /**
   * Vérifie si l'utilisateur a le rôle 'admin'.
   * @param userRole Rôle de l'utilisateur
   * @throws ForbiddenException Si l'utilisateur n'est pas admin
   */
  private checkAdminRole(userRole: string): void {
    if (userRole !== 'admin') {
      throw new ForbiddenException(
        'Seuls les administrateurs peuvent effectuer cette action',
      );
    }
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
