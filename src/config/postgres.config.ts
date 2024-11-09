import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool(
  process.env.NODE_ENV === 'production'
    ? {
        connectionString: process.env.POSTGRESQL_URL,
      }
    : {
        host: 'localhost',
        port: 5432,
        user: 'arcadia', // Utilisateur pour le développement
        password: 'root78', // Mot de passe pour le développement
        database: 'postgres',
      },
);

const poolWithDb = new Pool(
  process.env.NODE_ENV === 'production'
    ? {
        connectionString: process.env.POSTGRESQL_ARCADIA_URL,
      }
    : {
        host: 'localhost',
        port: 5432,
        user: 'arcadia', // Utilisateur pour le développement
        password: 'root78', // Mot de passe pour le développement
        database: 'arcadia_db',
      },
);

export const query = async (text: string, params?: any[]) => {
  return poolWithDb.query(text, params);
};

export { pool, poolWithDb };
