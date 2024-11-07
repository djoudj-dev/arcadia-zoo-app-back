import { Feature } from './feature.model';

export interface Service {
  id_service: number;
  name: string;
  description: string;
  images?: string;
  created_at?: Date;
  updated_at?: Date;
  features?: Feature[];
}
