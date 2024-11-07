export interface Feature {
  id_feature: number;
  name: string; // Nom de la caractéristique, ex: "prix", "horaire"
  type: string; // Type de la caractéristique, ex: "monétaire", "horaire"
  value?: string; // Valeur spécifique à la caractéristique pour ce service
  created_at?: Date;
  updated_at?: Date;
}
