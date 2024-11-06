export interface Feature {
  id_feature: number;
  name: string;
  type: string; // Type du service, par ex. : 'Restaurant', 'Visite guidée', etc.
  value?: string; // Valeur spécifique à la caractéristique pour ce service
  created_at?: Date;
  updated_at?: Date;
}
