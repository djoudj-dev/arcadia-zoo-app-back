import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { QueryResult } from 'pg';
import { pool, query } from '../../../../../config/postgres.config';
import { Feature } from '../models/feature.model';
import { Service } from '../models/service.model';

@Injectable()
export class ServiceService {
  async getAllServices(): Promise<Service[]> {
    const res = await query(`
      SELECT s.id_service, s.name, s.description, s.images, s.created_at, s.updated_at,
             f.id_feature, f.name AS feature_name, f.type AS feature_type, sf.value
      FROM services s
      LEFT JOIN service_features sf ON s.id_service = sf.service_id
      LEFT JOIN features f ON sf.feature_id = f.id_feature
    `);

    return this.groupFeatures(res.rows);
  }

  async getAllFeatures(): Promise<Feature[]> {
    const res = await query(`SELECT * FROM features`);
    return res.rows;
  }

  private groupFeatures(rows: any[]): Service[] {
    const serviceMap = new Map<number, Service>();
    const baseUrl = process.env.API_URL || 'https://arcadia-api.nedellec-julien.fr';

    rows.forEach((row) => {
      if (!serviceMap.has(row.id_service)) {
        serviceMap.set(row.id_service, {
          id_service: row.id_service,
          name: row.name,
          description: row.description,
          images: this.formatImageUrl(row.images, baseUrl),  // Formater l'URL de l'image
          created_at: row.created_at,
          updated_at: row.updated_at,
          features: [],
        });
      }
      if (row.id_feature) {
        const service = serviceMap.get(row.id_service);
        if (service) {
          // Vérifiez si features est défini, sinon initialisez-le
          service.features = service.features || [];
          service.features.push({
            id_feature: row.id_feature,
            name: row.feature_name,
            type: row.feature_type,
            value: row.value,
          });
        }
      }
    });
    return Array.from(serviceMap.values());
  }

  async createService(
    serviceData: { name: string; description: string; images?: string },
    features: Feature[],
    userRole: string,
  ): Promise<Service> {
    this.checkUserRole(userRole);

    const { name, description, images } = serviceData;
    if (!name || !description || !images) {
      throw new BadRequestException(
        'Les champs "name", "description" et "images" sont requis.',
      );
    }

    // Insère le service dans la table `services`
    const res: QueryResult<any> = await query(
      `
      INSERT INTO services (name, description, images, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
      [name, description, images],
    );
    const createdService = res.rows[0];

    // Pour chaque feature, assurez-vous qu'elle est dans la table `features` et liez-la au service
    for (const feature of features) {
      let featureId;

      // Vérifiez si la feature existe déjà dans `features`
      const featureRes = await query(
        `SELECT id_feature FROM features WHERE name = $1 AND type = $2`,
        [feature.name, feature.type],
      );

      if (featureRes?.rowCount && featureRes?.rows?.[0]) {
        featureId = featureRes.rows[0].id_feature;
      } else {
        // Sinon, insérez la feature et récupérez son id
        const newFeatureRes = await query(
          `
          INSERT INTO features (name, type, created_at, updated_at)
          VALUES ($1, $2, NOW(), NOW()) RETURNING id_feature`,
          [feature.name, feature.type],
        );
        featureId = newFeatureRes.rows[0].id_feature;
      }

      // Insérez l'association dans `service_features` avec la valeur de la feature
      await query(
        `
        INSERT INTO service_features (service_id, feature_id, value, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())`,
        [createdService.id_service, featureId, feature.value],
      );
    }

    return this.formatService(createdService);
  }

  async updateService(
    serviceData: { name: string; description: string; images?: string },
    id: number,
    features: Feature[],
    userRole: string,
  ): Promise<Service> {
    this.checkUserRole(userRole);

    const { name, description, images } = serviceData;
    if (!name || !description || !images) {
      throw new BadRequestException(
        'Les champs "name", "description" et "images" sont requis.',
      );
    }

    // Vérifier si le service existe avant de démarrer la transaction
    const existingService = await this.findOne(id);
    if (!existingService) {
      throw new BadRequestException(`Service non trouvé avec l'ID : ${id}`);
    }

    // Valider les caractéristiques avant de démarrer la transaction
    for (const feature of features) {
      if (!feature.name || !feature.type) {
        throw new BadRequestException(
          'Chaque caractéristique doit avoir un "name" et un "type" non vides.',
        );
      }
    }

    // Démarrer une transaction
    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Mise à jour du service dans la table `services`
      const res: QueryResult<any> = await query(
        `
        UPDATE services
        SET name = $1, description = $2, images = $3, updated_at = NOW()
        WHERE id_service = $4 RETURNING *`,
        [name, description, images, id],
      );

      const updatedService = res.rows[0];

      for (const feature of features) {
        let featureId;

        // Rechercher ou insérer la caractéristique dans `features`
        const featureRes = await query(
          `SELECT id_feature FROM features WHERE name = $1 AND type = $2`,
          [feature.name, feature.type],
        );

        if (featureRes?.rowCount && featureRes?.rows?.[0]) {
          featureId = featureRes.rows[0].id_feature;
        } else {
          const newFeatureRes = await query(
            `
            INSERT INTO features (name, type, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW()) RETURNING id_feature`,
            [feature.name, feature.type],
          );
          featureId = newFeatureRes.rows[0].id_feature;
        }

        // Rechercher ou mettre à jour la relation dans `service_features`
        const serviceFeatureRes = await query(
          `SELECT * FROM service_features WHERE service_id = $1 AND feature_id = $2`,
          [id, featureId],
        );

        if (
          serviceFeatureRes.rowCount !== null &&
          serviceFeatureRes.rowCount > 0
        ) {
          await query(
            `
            UPDATE service_features
            SET value = $1, updated_at = NOW()
            WHERE service_id = $2 AND feature_id = $3`,
            [feature.value, id, featureId],
          );
        } else {
          await query(
            `
            INSERT INTO service_features (service_id, feature_id, value, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())`,
            [id, featureId, feature.value],
          );
        }
      }

      // Confirmer la transaction
      await client.query('COMMIT');

      return this.formatService(updatedService);
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await client.query('ROLLBACK');
      throw error;
    }
  }

  async deleteService(
    id: number,
    userRole: string,
  ): Promise<{ message: string }> {
    this.checkUserRole(userRole);

    const existingService = await this.findOne(id);
    if (!existingService) {
      throw new BadRequestException(`Service avec l'ID ${id} non trouvé`);
    }

    const imagePath: string = path.join(
      process.cwd(),
      existingService.images ?? '',
    );

    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
        console.log(`Image supprimée: ${imagePath}`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `Erreur lors de la suppression de l'image: ${error.message}`,
          );
        } else {
          console.error(`Erreur inconnue lors de la suppression de l'image`);
        }
        if (error instanceof Error) {
          console.error(
            `Erreur lors de la suppression de l'image: ${error.message}`,
          );
        } else {
          console.error(`Erreur inconnue lors de la suppression de l'image`);
        }
      }
    } else {
      console.log(`Image non trouvée pour suppression: ${imagePath}`);
    }

    await query('DELETE FROM services WHERE id_service = $1', [id]);
    return { message: `Service avec l'ID ${id} supprimé avec succès` };
  }

  async findOne(id: number): Promise<Service | null> {
    const res = await query(
      `
      SELECT *
      FROM services
      WHERE id_service = $1`,
      [id],
    );
    if (res.rowCount === 0) {
      return null;
    }
    return this.formatService(res.rows[0]);
  }

  async findById(id: number): Promise<Service | null> {
    return this.findOne(id);
  }

  private formatService(row: any): Service {
    const baseUrl = process.env.API_URL || 'https://arcadia-api.nedellec-julien.fr';
    return {
      id_service: row.id_service,
      name: row.name,
      description: row.description,
      images: this.formatImageUrl(row.images, baseUrl),
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

    // Nettoyer le chemin pour éviter les doublons
    let cleanPath = imageUrl;

    // Supprimer les préfixes redondants
    cleanPath = cleanPath.replace(/^\/?images\/services\//, '');
    cleanPath = cleanPath.replace(/^\/?services\//, '');

    return `${baseUrl}/api/images/services/${cleanPath}`;
  }

  private checkUserRole(userRole: string) {
    if (userRole !== 'admin' && userRole !== 'employe') {
      throw new BadRequestException("Vous n'avez pas les droits suffisants");
    }
  }
}
