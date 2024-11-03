// src/config/postgres.config.ts

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

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
        role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL
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
 * Initialisation d'un administrateur dans la table `users`.
 */
const initializeAdminUser = async () => {
  const res = await query(`SELECT COUNT(*) FROM users WHERE email = $1`, [
    'admin@example.com',
  ]);
  if (parseInt(res.rows[0].count, 10) === 0) {
    const hashedPassword = await bcrypt.hash('adminpassword', 10);
    await query(
      `INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4)`,
      ['Admin', 'admin@example.com', hashedPassword, 1], // `role_id` peut être défini sur celui d'un administrateur
    );
    console.log('Utilisateur administrateur initial créé : admin@example.com');
  } else {
    console.log("L'utilisateur administrateur existe déjà");
  }
};

/**
 * Initialisation des rôles dans la table `roles`.
 * Insère les rôles "Admin", "Employe" et "Veterinaire" si la table est vide.
 */
const initializeRoles = async () => {
  const client = await poolWithDb.connect(); // Utilise `poolWithDb` pour accéder à `arcadia_db`
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

  try {
    const client = await poolWithDb.connect();
    console.log('Connexion à PostgreSQL réussie sur arcadia_db');
    client.release(); // Libérer le client après vérification

    // Initialiser l'utilisateur administrateur après la connexion
    await initializeAdminUser();

    // Initialiser les rôles après la connexion
    await initializeRoles();
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
