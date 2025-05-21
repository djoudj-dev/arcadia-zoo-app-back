import * as dotenv from 'dotenv';
import { Pool, QueryResult } from 'pg';

// Charger .env.local si on est en développement
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

console.log('Initializing PostgreSQL connection...');
console.log('Environment:', process.env.NODE_ENV);

// Masquer les informations sensibles dans les logs
const logSafeUrl = process.env.POSTGRES_URL?.replace(
  /(postgres:\/\/)([^:]+):([^@]+)@/,
  '$1$2:****@',
);
console.log('PostgreSQL URL (masked):', logSafeUrl);

// Modifier l'URL pour désactiver SSL explicitement
const connectionUrl = process.env.POSTGRES_URL + '?sslmode=disable';
console.log('Connection mode: SSL disabled');

const pool = new Pool({
  connectionString: connectionUrl,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Explicitly set the dialect to PostgreSQL
  dialect: 'postgres',
});

// Ajouter des listeners pour les événements de connexion
pool.on('connect', () => {
  console.log('PostgreSQL connected successfully');
  console.log('Connection parameters:', {
    ssl: false,
    environment: process.env.NODE_ENV,
    host: new URL(process.env.POSTGRES_URL || '').hostname,
  });
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
  console.error('Connection details:', {
    url: logSafeUrl,
    environment: process.env.NODE_ENV,
    ssl: false,
  });
});

export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const client = await pool.connect();
  try {
    console.log('Executing query:', text);
    // Specify that we're using PostgreSQL dialect
    const result = await client.query({
      text,
      values: params,
      // Explicitly set the dialect to PostgreSQL
      dialect: 'postgres',
    });
    console.log('Query executed successfully');
    return result;
  } catch (error) {
    console.error("Erreur lors de l'exécution de la requête SQL :", error);
    console.error('Query parameters:', params);
    throw error;
  } finally {
    client.release();
  }
};

export { pool };
