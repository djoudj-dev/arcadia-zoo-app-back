import * as dotenv from 'dotenv';
import { Pool } from 'pg';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la connexion à PostgreSQL pour l'environnement du VPS
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'arcadia', // Valeur par défaut pour le développement
  password: process.env.DB_PASSWORD || 'arcadia78', // Valeur par défaut pour le développement
  database: process.env.DB_NAME || 'arcadia_db', // Nom de la base de données
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

// Exporter `pool` et `createAdminUser` explicitement
export { pool };
