import * as bcrypt from 'bcrypt';
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

// Fonction pour créer un utilisateur administrateur
export const createAdminUser = async () => {
  const adminEmail = 'admin@mail.com';

  try {
    console.log(
      "Vérification de l'existence de l'utilisateur administrateur...",
    );

    // Vérifiez si l'utilisateur admin existe déjà
    const checkUser = await query('SELECT * FROM users WHERE email = $1', [
      adminEmail,
    ]);

    if (checkUser.rows.length > 0) {
      console.log('L’utilisateur administrateur existe déjà.');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Mot de passe haché pour l’administrateur :', hashedPassword);

    // Insertion de l'utilisateur administrateur
    const insertUserQuery = `
      INSERT INTO users (name, email, password, role_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `;
    await query(insertUserQuery, ['Admin', adminEmail, hashedPassword, 1]);

    console.log('Utilisateur administrateur créé avec succès.');
  } catch (err) {
    console.error(
      'Erreur lors de la création de l’utilisateur administrateur :',
      err,
    );
  }
};

// Exporter `pool` et `createAdminUser` explicitement
export { pool };
