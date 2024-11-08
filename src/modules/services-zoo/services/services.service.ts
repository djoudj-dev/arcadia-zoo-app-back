import { Injectable } from '@nestjs/common';
import { query } from 'src/config/postgres.config';
import { Service } from 'src/modules/admin-dashboard/service-management/models/service.model';

@Injectable()
export class ServicesService {
  /**
   * Récupère tous les services et leurs features en les regroupant.
   * @returns Une promesse qui contient un tableau de services
   */
  async getAllServices(): Promise<Service[]> {
    const res = await query(`
      SELECT s.id_service, s.name, s.description, s.images, s.created_at, s.updated_at,
             f.id_feature, f.name AS feature_name, f.type AS feature_type, sf.value
      FROM services s
      LEFT JOIN service_features sf ON s.id_service = sf.service_id
      LEFT JOIN features f ON sf.feature_id = f.id_feature
      ORDER BY s.id_service
    `);

    // Regroupe les services et leurs features
    const servicesMap: { [key: number]: Service } = {};

    res.rows.forEach((row) => {
      // Si le service n'existe pas encore dans le map, on l'ajoute
      if (!servicesMap[row.id_service]) {
        servicesMap[row.id_service] = {
          id_service: row.id_service,
          name: row.name,
          description: row.description,
          images: row.images,
          created_at: row.created_at,
          updated_at: row.updated_at,
          features: [],
        };
      }

      // Si une feature est présente, on l'ajoute à la liste des features du service
      if (row.id_feature) {
        servicesMap[row.id_service].features.push({
          id_feature: row.id_feature,
          name: row.feature_name,
          type: row.feature_type,
          value: row.value,
        });
      }
    });

    // Retourne un tableau de services avec les features regroupées
    return Object.values(servicesMap);
  }
}
