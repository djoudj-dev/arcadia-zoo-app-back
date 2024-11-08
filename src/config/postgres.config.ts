import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config(); // Chargement des variables d'environnement

// Pool pour la connexion à la base de données par défaut
const pool = new Pool({
  connectionString:
    process.env.POSTGRESQL_URL ||
    'postgresql://user:password@localhost:5432/postgres',
});

/**
 * Fonction pour créer la base de données `arcadia_db` si elle n'existe pas.
 */
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
    console.error(
      'Erreur lors de la vérification ou de la création de la base de données',
      error,
    );
    process.exit(1);
  } finally {
    client.release();
  }
};

// Pool de connexion spécifique à `arcadia_db`
const poolWithDb = new Pool({
  connectionString:
    process.env.POSTGRESQL_ARCADIA_URL ||
    'postgresql://user:password@localhost:5432/arcadia_db',
});

const createServicesTable = async () => {
  const client = await poolWithDb.connect();
  try {
    // Table principale des services
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
    console.log(
      'Table `services` vérifiée/créée avec succès dans `arcadia_db`',
    );

    // Table des caractéristiques générales (features)
    await client.query(`
      CREATE TABLE IF NOT EXISTS features (
        id_feature SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL, -- Nom de la caractéristique, ex: "prix", "horaire"
        type VARCHAR(50) NOT NULL, -- Type de caractéristique, ex: "monétaire", "horaire"
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log(
      'Table `features` vérifiée/créée avec succès dans `arcadia_db`',
    );

    // Table pivot pour lier les services et les caractéristiques
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_features (
        id SERIAL PRIMARY KEY,
        service_id INT REFERENCES services(id_service) ON DELETE CASCADE,
        feature_id INT REFERENCES features(id_feature) ON DELETE CASCADE,
        value VARCHAR(255), -- Valeur de la caractéristique, ex: "10€", "09:00-18:00"
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log(
      'Table `service_features` vérifiée/créée avec succès dans `arcadia_db`',
    );
  } catch (error) {
    console.error('Erreur lors de la création des tables', error);
    process.exit(1);
  } finally {
    client.release();
  }
};

/**
 * Fonction pour créer la table `habitats` dans `arcadia_db` si elle n'existe pas.
 */
const createHabitatsTable = async () => {
  const client = await poolWithDb.connect();
  try {
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
    console.log(
      'Table `habitats` vérifiée/créée avec succès dans `arcadia_db`',
    );
  } catch (error) {
    console.error('Erreur lors de la création de la table `habitats`', error);
    process.exit(1);
  } finally {
    client.release();
  }
};

/**
 * Fonction pour créer la table `animals` dans `arcadia_db` si elle n'existe pas.
 */
const createAnimalsTable = async () => {
  const client = await poolWithDb.connect();
  try {
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
    console.log('Table `animals` vérifiée/créée avec succès dans `arcadia_db`');
  } catch (error) {
    console.error('Erreur lors de la création de la table `animals`', error);
    process.exit(1);
  } finally {
    client.release();
  }
};

/**
 * Fonction pour créer la table `roles` dans `arcadia_db` si elle n'existe pas.
 */
const createRolesTable = async () => {
  const client = await poolWithDb.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      )
    `);
    console.log('Table `roles` vérifiée/créée avec succès dans `arcadia_db`');
  } catch (error) {
    console.error('Erreur lors de la création de la table `roles`', error);
    process.exit(1);
  } finally {
    client.release();
  }
};

/**
 * Fonction pour créer la table `users` dans `arcadia_db` si elle n'existe pas.
 * Cette table inclut une référence vers la table `roles`.
 */
const createUsersTable = async () => {
  const client = await poolWithDb.connect();
  try {
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
    console.log('Table `users` vérifiée/créée avec succès dans `arcadia_db`');
  } catch (error) {
    console.error('Erreur lors de la création de la table `users`', error);
    process.exit(1);
  } finally {
    client.release();
  }
};

/**
 * Initialisation des rôles dans la table `roles`.
 * Insère les rôles "Admin", "Employe" et "Veterinaire" si la table est vide.
 */
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
      console.log(
        "Rôles 'Admin', 'Employe' et 'Veterinaire' ajoutés à la table roles dans `arcadia_db`",
      );
    } else {
      console.log('Les rôles existent déjà dans la table roles');
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation des rôles", error);
  } finally {
    client.release();
  }
};

// Vérification de la connexion à `arcadia_db`
export const connectPostgres = async () => {
  await createDatabase(); // Créer la base de données si elle n'existe pas
  await createRolesTable(); // Créer la table `roles` si elle n'existe pas
  await createUsersTable(); // Créer la table `users` si elle n'existe pas
  await createHabitatsTable(); // Créer la table `habitats` si elle n'existe pas
  await createAnimalsTable(); // Créer la table `animals` si elle n'existe pas
  await createServicesTable(); // Créer la table `services` si elle n'existe pas

  try {
    const client = await poolWithDb.connect();
    console.log('Connexion à PostgreSQL réussie sur arcadia_db');
    client.release();

    await initializeRoles(); // Initialiser les rôles après la connexion
  } catch (error) {
    console.error('Erreur de connexion à PostgreSQL', error);
    process.exit(1);
  }
};

/**
 * Fonction pour exécuter des requêtes SQL dans la base de données `arcadia_db`.
 *
 * @param text - La requête SQL à exécuter.
 * @param params - Les paramètres optionnels pour la requête SQL.
 * @returns Le résultat de la requête SQL.
 */
export const query = (text: string, params?: any[]) =>
  poolWithDb.query(text, params);

// Exportation de pool
export { createDatabase, pool };
