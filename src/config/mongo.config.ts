import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

// Charger les variables d'environnement pour le local
//dotenv.config({ path: './.env.local' });
// Charger les variables d'environnement pour le VPS
dotenv.config({ path: './.env' });

/**
 * URI de connexion à MongoDB.
 * Si la variable d'environnement `MONGO_URI` est définie, elle sera utilisée,
 * sinon l'URI par défaut `mongodb://localhost:27017/arcadia_db` sera appliqué.
 */
const mongoUri =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/arcadia_db';

/**
 * Fonction pour établir une connexion avec MongoDB.
 * En cas de succès, un message de confirmation est affiché dans la console.
 * En cas d'échec, une erreur est affichée et le processus est arrêté.
 */
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connexion à MongoDB réussie');
    // Vérifier si la connexion à la base de données est établie
    if (mongoose.connection.readyState !== 1) {
      console.error("La connexion à la base de données n'est pas établie");
      return;
    }

    // Vérifier si mongoose.connection.db est défini avant de l'utiliser
    const admin = mongoose.connection.db?.admin();
    if (!admin) {
      console.error("L'objet admin n'est pas disponible");
      return;
    }
    // Utiliser une promesse pour récupérer les bases de données
    const result = await admin.listDatabases();
    console.log('Bases de données disponibles :', result.databases);
  } catch (error) {
    console.error('Erreur de connexion à MongoDB', error);
    process.exit(1); // Arrêter le processus en cas d'échec de connexion
  }
};
