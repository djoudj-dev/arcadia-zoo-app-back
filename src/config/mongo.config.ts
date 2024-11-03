import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

/**
 * Chargement des variables d'environnement depuis le fichier .env.
 * Cette configuration permet d'accéder aux variables d'environnement dans le code.
 */
dotenv.config();

/**
 * URI de connexion à MongoDB.
 * Si la variable d'environnement `MONGO_URI` est définie, elle sera utilisée,
 * sinon l'URI par défaut `mongodb://localhost:27017/arcadia_db` sera appliqué.
 */
const mongoUri =
  process.env.MONGO_URI || 'mongodb://localhost:27017/arcadia_db';

/**
 * Fonction pour établir une connexion avec MongoDB.
 * En cas de succès, un message de confirmation est affiché dans la console.
 * En cas d'échec, une erreur est affichée et le processus est arrêté.
 */
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connexion à MongoDB réussie');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB', error);
    process.exit(1); // Arrêter le processus en cas d'échec de connexion
  }
};
