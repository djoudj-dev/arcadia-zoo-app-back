import { Role } from './role.model';

/**
 * Modèle de données pour un utilisateur.
 * Représente les informations d'un utilisateur dans la base de données.
 */
export class User {
  id!: number; // Id de l'utilisateur
  name!: string; // Nom de l'utilisateur
  email!: string; // Adresse e-mail de l'utilisateur
  password!: string; // Mot de passe de l'utilisateur
  role!: Role; // Rôle de l'utilisateur
  role_id!: number; // Id du rôle de l'utilisateur
  created_at!: Date; // Date de création de l'utilisateur
  updated_at!: Date; // Date de mise à jour de l'utilisateur
}
