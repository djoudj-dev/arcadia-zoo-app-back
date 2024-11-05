/**
 * Modèle de données pour un animal.
 * Représente les informations principales d'un animal dans la base de données.
 */
export class Animal {
  id_animal: number; // Id de l'animal
  name: string; // Nom de l'animal
  images: string; // Chemin de l'image de l'animal
  species: string; // Espèce de l'animal
  characteristics: string; // Caractéristiques de l'animal
  weightRange: string; // Plage de poids de l'animal
  diet: string; // Régime alimentaire de l'animal
  habitat_id: number; // Id de l'habitat de l'animal
  vetNote: string; // Note du vétérinaire sur l'animal
  created_at: Date; // Date de création de l'animal
  updated_at: Date; // Date de mise à jour de l'animal
}
