/**
 * Modèle de données pour un habitat.
 * Représente les informations principales d'un habitat dans la base de données.
 */
export class Habitat {
  id_habitat!: number; // Id de l'habitat
  name!: string; // Nom de l'habitat
  description!: string; // Description de l'habitat
  images!: string; // Chemin de l'image de l'habitat
  created_at!: Date; // Date de création de l'habitat
  updated_at!: Date; // Date de mise à jour de l'habitat
}
