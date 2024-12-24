import * as dotenv from 'dotenv';
import { Pool } from 'pg';

// Détecter l'environnement (par défaut : développement local)
const environment = process.env.NODE_ENV || 'local';

// Charger le fichier `.env` approprié
dotenv.config({ path: `./.env.${environment}` });

// Configuration de la connexion à PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'arcadia',
  password: process.env.DB_PASSWORD || 'arcadia78',
  database: process.env.DB_NAME || 'arcadia_db',
});

// Fonction générique pour exécuter une requête
export const query = async (text: string, params?: any[]) => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error('Erreur lors de l’exécution de la requête SQL :', error);
    throw error;
  }
};

// Exporter `pool` explicitement
export { pool };
