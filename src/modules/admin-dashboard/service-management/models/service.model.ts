import { Feature } from './feature.model';

export interface Service {
  id_service: number;
  name: string;
  description: string;
  images?: string; // URL ou chemin vers l'image du service
  created_at?: Date;
  updated_at?: Date;
  features?: Feature[]; // Liste de caractéristiques liées au service
}
