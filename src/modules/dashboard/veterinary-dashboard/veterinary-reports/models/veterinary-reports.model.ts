export interface VeterinaryReports {
  id_veterinary_reports: string; // Identifiant unique généré par MongoDB.
  id_animal: number; // Relation avec un animal existant (référencé par son modèle ou son ID).
  id_user: number; // Référence à l'ID du vétérinaire.
  visit_date: Date; // Date de passage du vétérinaire.
  animal_state: string; // État de l'animal (Bonne santé, Blessé, Malade).

  // Recommandations alimentaires
  recommended_food_type: string; // Type de nourriture recommandé.
  recommended_food_quantity: number; // Grammage recommandé.
  food_unit: string; // Unité de mesure (g, kg, etc.).

  additional_details?: string; // Détails supplémentaires facultatifs (observations, diagnostic).

  createdAt: Date; // Date de création du rapport.
  updatedAt: Date; // Dernière date de mise à jour.
}
