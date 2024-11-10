import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

dotenv.config();

// Configuration pour les pools de connexions
const pool = new Pool(
  process.env.NODE_ENV === 'production'
    ? {
        connectionString: process.env.POSTGRESQL_URL,
      }
    : {
        host: 'localhost',
        port: 5432,
        user: 'arcadia',
        password: 'root78',
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
        user: 'arcadia',
        password: 'root78',
        database: 'arcadia_db',
      },
);

// Création de la base de données `arcadia_db` si elle n'existe pas
const createDatabase = async () => {
  const client = await pool.connect();
  try {
    const dbName = 'arcadia_db';
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Base de données ${dbName} créée avec succès`);
    } else {
      console.log(`Base de données ${dbName} existe déjà`);
    }
  } catch (error) {
    console.error('Erreur lors de la création de la base de données', error);
  } finally {
    client.release();
  }
};

// Création des tables dans `arcadia_db`
const createTables = async () => {
  const client = await poolWithDb.connect();
  try {
    // Table Services
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id_service SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        images VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Table Features
    await client.query(`
      CREATE TABLE IF NOT EXISTS features (
        id_feature SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Table Service_Features
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_features (
        id SERIAL PRIMARY KEY,
        service_id INT REFERENCES services(id_service) ON DELETE CASCADE,
        feature_id INT REFERENCES features(id_feature) ON DELETE CASCADE,
        value VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Table Habitats
    await client.query(`
      CREATE TABLE IF NOT EXISTS habitats (
        id_habitat SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        images VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Table Animals
    await client.query(`
      CREATE TABLE IF NOT EXISTS animals (
        id_animal SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        species VARCHAR(100) NOT NULL,
        characteristics TEXT NOT NULL,
        weight_range VARCHAR(100) NOT NULL,
        diet TEXT NOT NULL,
        habitat_id INTEGER REFERENCES habitats(id_habitat) ON DELETE SET NULL,
        images VARCHAR(255) NOT NULL,
        vet_note TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Table Roles
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      )
    `);

    // Table Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Toutes les tables ont été vérifiées/créées');
  } catch (error) {
    console.error('Erreur lors de la création des tables', error);
  } finally {
    client.release();
  }
};

// Initialisation des rôles dans la table `roles`
const initializeRoles = async () => {
  const client = await poolWithDb.connect();
  try {
    const res = await client.query(`SELECT COUNT(*) FROM roles`);
    if (parseInt(res.rows[0].count, 10) === 0) {
      await client.query(`INSERT INTO roles (name) VALUES ($1), ($2), ($3)`, [
        'Admin',
        'Employe',
        'Veterinaire',
      ]);
      console.log("Rôles 'Admin', 'Employe' et 'Veterinaire' ajoutés");
    } else {
      console.log('Les rôles existent déjà');
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation des rôles", error);
  } finally {
    client.release();
  }
};

// Création de l'utilisateur Admin
const createAdminUser = async () => {
  const client = await poolWithDb.connect();
  const saltRounds = 10;
  const adminEmail = 'admin@mail.com';
  const adminPassword = 'admin123';

  try {
    // Vérifier l'existence de l'utilisateur Admin
    const existingAdmin = await client.query(
      `SELECT * FROM users WHERE email = $1`,
      [adminEmail],
    );

    if (existingAdmin.rowCount === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
      const roleAdmin = await client.query(
        `SELECT id FROM roles WHERE name = 'Admin'`,
      );

      if (roleAdmin.rowCount > 0) {
        await client.query(
          `INSERT INTO users (name, email, password, role_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          ['Admin', adminEmail, hashedPassword, roleAdmin.rows[0].id],
        );
        console.log("L'utilisateur Admin a été créé avec succès");
      } else {
        console.error("Rôle 'Admin' introuvable. Vérifiez les rôles.");
      }
    } else {
      console.log("L'utilisateur Admin existe déjà");
    }
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur Admin", error);
  } finally {
    client.release();
  }
};

// Initialisation complète
export const connectPostgres = async () => {
  await createDatabase();
  await createTables();
  await initializeRoles();
  await createAdminUser();
};

// Fonction d'exécution de requête
export const query = async (text: string, params?: any[]) =>
  poolWithDb.query(text, params);

export { pool, poolWithDb };
