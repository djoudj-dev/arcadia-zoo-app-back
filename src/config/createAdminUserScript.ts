// createAdminUserScript.ts

import { createAdminUser } from './postgres.config';

createAdminUser()
  .then(() => console.log('Utilisateur administrateur créé avec succès.'))
  .catch((error) =>
    console.error("Erreur lors de l'ajout de l'utilisateur :", error),
  );
