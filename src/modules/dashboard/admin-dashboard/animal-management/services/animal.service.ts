import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { query } from '../../../../../config/postgres.config';
import { Animal } from '../models/animal.model';

/**
 * Service pour gérer les opérations CRUD des animaux.
 */
@Injectable()
export class AnimalService {
  /**
   * Récupère tous les animaux de la base de données.
   * @returns Une promesse d'un tableau d'objets Animal.
   */
  async getAllAnimals(): Promise<Animal[]> {
    const res = await query(`
      SELECT id_animal, name, species, images, characteristics, weight_range, diet, habitat_id, habitat_id, vet_note, created_at, updated_at
      FROM animals
    `);
    return res.rows.map((row) => this.formatAnimal(row));
  }

  /**
   * Récupère un animal spécifique par son ID.
   * @param id Identifiant de l'animal
   * @returns La promesse de l'objet Animal trouvé
   */
  async getAnimalById(id: number): Promise<Animal | null> {
    const res = await query('SELECT * FROM animals WHERE id_animal = $1', [id]);
    return res.rows[0] ? this.formatAnimal(res.rows[0]) : null;
  }

  /**
   * Crée un nouvel animal après validation des données et du rôle d'utilisateur.
   * @param animalData Données de l'animal partiellement remplies
   * @param userRole Rôle de l'utilisateur pour vérification des autorisations
   * @returns La promesse de l'objet Animal créé
   * @throws BadRequestException Si des champs requis sont manquants
   */
  async createAnimal(
    animalData: Partial<Animal>,
    userRole: string,
  ): Promise<Animal> {
    console.log("Début de la création de l'animal");
    this.checkAdminRole(userRole);
    console.log("Rôle de l'utilisateur vérifié:", userRole);

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
    console.log("Données de l'animal reçues:", animalData);

    if (
      !name ||
      !species ||
      !characteristics ||
      !weightRange ||
      !diet ||
      !habitat_id ||
      !images
    ) {
      console.error(
        'Les champs "name", "species", "characteristics", "weightRange", "diet", "habitat_id" et "images" sont requis.',
      );
      throw new BadRequestException(
        'Les champs "name", "species", "characteristics", "weightRange", "diet", "habitat_id" et "images" sont requis.',
      );
    }

    try {
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
      console.log('Animal créé avec succès:', res.rows[0]);
      return this.formatAnimal(res.rows[0]);
    } catch (err) {
      console.error("Erreur lors de la création de l'animal:", err);
      throw new BadRequestException("Erreur lors de la création de l'animal");
    }
  }

  /**
   * Met à jour les informations d'un animal existant.
   * @param id Identifiant de l'animal à mettre à jour
   * @param animalData Nouvelles données de l'animal partiellement remplies
   * @param userRole Rôle de l'utilisateur pour vérification des autorisations
   * @returns La promesse de l'objet Animal mis à jour
   * @throws BadRequestException Si l'animal avec l'ID spécifié n'existe pas
   */
  async updateAnimal(
    id: number,
    animalData: Partial<Animal>,
    userRole: string,
  ): Promise<Animal> {
    this.checkAdminRole(userRole);

    const existingAnimal = await this.findOne(id);
    if (!existingAnimal) {
      throw new BadRequestException(`Animal avec l'ID ${id} non trouvé`);
    }

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

    const res = await query(
      `UPDATE animals SET 
         name = COALESCE($1, name),
         species = COALESCE($2, species),
         characteristics = COALESCE($3, characteristics),
         weight_range = COALESCE($4, weight_range),
         diet = COALESCE($5, diet),
         habitat_id = COALESCE($6, habitat_id),
         images = COALESCE($7, images),
         vet_note = COALESCE($8, vet_note),
         updated_at = NOW()
       WHERE id_animal = $9 RETURNING *`,
      [
        name,
        species,
        characteristics,
        weightRange,
        diet,
        habitat_id,
        images || existingAnimal.images, // Garde l'ancienne image si pas de nouvelle
        vetNote || existingAnimal.vetNote,
        id,
      ],
    );

    return this.formatAnimal(res.rows[0]);
  }

  /**
   * Supprime un animal spécifique, y compris l'image associée.
   * @param id Identifiant de l'animal à supprimer
   * @param userRole Rôle de l'utilisateur pour vérification des autorisations
   * @returns La promesse de l'objet Animal supprimé
   * @throws BadRequestException Si l'animal avec l'ID spécifié n'existe pas
   */
  async deleteAnimal(id: number, userRole: string): Promise<Animal> {
    this.checkAdminRole(userRole);
    const existingAnimal = await this.findOne(id);
    if (!existingAnimal) {
      throw new BadRequestException(`Animal avec l'ID ${id} non trouvé`);
    }

    // Supprimer l'image associée
    const imagePath = path.join(process.cwd(), existingAnimal.images);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await query('DELETE FROM animals WHERE id_animal = $1', [id]);
    return existingAnimal;
  }

  /**
   * Récupère un animal spécifique par son ID.
   * @param id Identifiant de l'animal
   * @returns La promesse de l'objet Animal trouvé
   */
  async findOne(id: number): Promise<Animal | null> {
    const res = await query('SELECT * FROM animals WHERE id_animal = $1', [id]);
    return res.rows[0] ? this.formatAnimal(res.rows[0]) : null;
  }

  /**
   * Vérifie si l'utilisateur a le rôle "admin" pour accéder à certaines opérations.
   * @param userRole Rôle de l'utilisateur
   * @throws BadRequestException Si l'utilisateur n'a pas le rôle "admin"
   */
  private checkAdminRole(userRole: string): void {
    if (userRole !== 'admin') {
      console.error("L'utilisateur n'a pas le rôle 'admin'.");
      throw new BadRequestException(
        "Vous n'avez pas les autorisations nécessaires pour effectuer cette opération.",
      );
    }
  }

  /**
   * Formate les données d'un animal pour correspondre au modèle Animal.
   * @param row Ligne de données de la base de données
   * @returns Un objet Animal formaté
   */
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
