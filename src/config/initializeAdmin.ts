import * as bcrypt from 'bcrypt';
import { query } from './postgres.config'; // Importe la connexion PostgreSQL

const initializeAdminUser = async () => {
  try {
    // Vérifie si l'utilisateur admin existe déjà
    const res = await query('SELECT COUNT(*) FROM users WHERE email = $1', [
      'nedellec.julien.78@gmail.com',
    ]);

    if (parseInt(res.rows[0].count, 10) === 0) {
      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Insérer l'utilisateur admin
      await query(
        'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4)',
        ['Admin', 'nedellec.julien.78@gmail.com', hashedPassword, 1],
      );

      console.log('Utilisateur administrateur initial créé.');
    } else {
      console.log("L'utilisateur administrateur existe déjà.");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        "Erreur lors de la création de l'utilisateur administrateur :",
        error.message,
      );
    } else {
      console.error(
        "Erreur lors de la création de l'utilisateur administrateur :",
        error,
      );
    }
  }
};

// Appeler la fonction pour ajouter l'admin
initializeAdminUser();
