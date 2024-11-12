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
  return pool.query(text, params);
};

// Fonction pour créer un utilisateur administrateur
export const createAdminUser = async () => {
  const adminEmail = 'admin@mail.com';

  try {
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

// Appel de la fonction de création de l'utilisateur administrateur
createAdminUser()
  .then(() => console.log('Initialisation terminée'))
  .catch((err) =>
    console.error(
      "Erreur lors de l'initialisation de la base de données :",
      err,
    ),
  );

// Exporter `pool` explicitement
export { pool };
