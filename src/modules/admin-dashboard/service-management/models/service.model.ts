// models/service.model.ts

// Représente un service (Restaurant, Visite guidée, Visite en train)
export class Service {
  id_service: number;
  name: string;
  description: string;
  images?: string; // URL ou chemin vers l'image du service
  created_at?: Date;
  updated_at?: Date;
}

// Représente une caractéristique (Feature) d'un service
export class Feature {
  id_feature: number;
  name: string;
  type: string; // Ex : 'Restaurant', 'Visite guidee', 'Visite en train'
  created_at?: Date;
  updated_at?: Date;
}

// Représente un lien entre un Service (Restaurant) et une Feature spécifique avec une valeur personnalisée
export class RestaurantFeature {
  service_id: number;
  feature_id: number;
  value: string; // Valeur de la caractéristique spécifique
}

// Représente un lien entre un Service (Visite guidée) et une Feature spécifique avec une valeur personnalisée
export class VisiteGuideeFeature {
  service_id: number;
  feature_id: number;
  value: string; // Valeur de la caractéristique spécifique
}

// Représente un lien entre un Service (Visite en train) et une Feature spécifique avec une valeur personnalisée
export class VisiteTrainFeature {
  service_id: number;
  feature_id: number;
  value: string; // Valeur de la caractéristique spécifique
}
