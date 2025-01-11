import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

// Charger les variables d'environnement
dotenv.config({ path: './.env' });

dotenv.config({ path: './.env' });

const mongoUri =
  process.env.MONGO_URI || 'mongodb://localhost:27017/arcadia_db';

/**
 * Fonction pour établir une connexion avec MongoDB.
 */
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      connectTimeoutMS: 30000, // Vous pouvez ajuster le délai si nécessaire
    });
    console.log('Connexion à MongoDB réussie');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB :', error);
    process.exit(1); // Arrête le processus en cas d'échec
  }
};
