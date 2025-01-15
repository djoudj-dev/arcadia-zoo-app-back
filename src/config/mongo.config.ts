import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

// Charger .env.local si on est en développement
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const mongoUri = process.env.MONGODB_URI;

/**
 * Fonction pour établir une connexion avec MongoDB.
 */
export const connectMongoDB = async () => {
  try {
    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI non définie dans les variables d'environnement",
      );
    }

    console.log('Tentative de connexion à MongoDB...');
    await mongoose.connect(mongoUri, {
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
    });
    console.log('Connexion à MongoDB réussie');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB :', error);
    process.exit(1);
  }
};
