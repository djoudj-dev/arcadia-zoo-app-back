import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryResult } from 'pg';
import { query } from 'src/config/postgres.config';
import { Feature } from '../models/feature.model';
import { Service } from '../models/service.model';

@Injectable()
export class ServiceService {
  /**
   * Récupère tous les services de la base de données, y compris les caractéristiques associées.
   * @returns Une promesse d'un tableau d'objets Service.
   */
  async getAllServices(): Promise<Service[]> {
    const res = await query(`
      SELECT id_service, name, description, images, created_at, updated_at
      FROM services
    `);
    const services = await Promise.all(
      res.rows.map((row) => this.formatService(row)),
    );
    return services;
  }

  /**
   * Récupère les features d'un service spécifique.
   * @returns Une promesse d'un tableau d'objets Feature.
   */
  async getAllFeatures(): Promise<Feature[]> {
    const res = await query(
      `
      SELECT id_feature, name, type, value
      FROM features
    `,
    );
    const features: Feature[] = await Promise.all(
      res.rows.map((row) => this.formatFeature(row)),
    );
    return features;
  }

  /**
   * Crée un nouveau service avec les caractéristiques associées.
   * @param serviceData Objet Service à créer
   * @returns Une promesse de Service
   */
  async createService(
    serviceData: { name: string; description: string; images?: string },
    userRole: string,
  ): Promise<Service> {
    console.log('Début de la création de service');
    this.checkUserRole(userRole);
    console.log("Rôle de l'utilisateur vérifié :", userRole);

    const { name, description, images } = serviceData;
    console.log('Données du service reçues :', serviceData);

    if (!name || !description || !images) {
      console.error(
        'Les champs "name", "description" et "images" sont requis.',
      );
      throw new BadRequestException(
        'Les champs "name", "description" et "images" sont requis.',
      );
    }

    try {
      const res: QueryResult<any> = await query(
        `
        INSERT INTO services (name, description, images, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [name, description, images],
      );
      console.log('Service créé avec succès :', res.rows[0]);
      return this.formatService(res.rows[0]);
    } catch (error) {
      console.error('Erreur lors de la création du service :', error.message);
      throw new BadRequestException(`
        Erreur lors de la création du service: ${error.message}`);
    }
  }

  private async formatService(row: any): Promise<Service> {
    return {
      id_service: row.id_service,
      name: row.name,
      description: row.description,
      images: row.images,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private formatFeature(row: any): Feature {
    return {
      id_feature: row.id_feature,
      name: row.name,
      type: row.type,
      value: row.value,
    };
  }

  private checkUserRole(userRole: string) {
    if (userRole !== 'admin') {
      throw new BadRequestException("Vous n'avez pas les droits suffisants");
    }
  }
}
