import * as dotenv from 'dotenv';
import { Pool } from 'pg';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la connexion à PostgreSQL pour l'environnement local
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'arcadia', // Utilisateur pour le développement
  password: 'arcadia78', // Mot de passe pour le développement
  database: 'arcadia_db', // Nom de la base de données
});

// Fonction générique pour exécuter une requête
export const query = async (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// Exporter le pool pour l'utiliser dans d'autres fichiers
export { pool };
