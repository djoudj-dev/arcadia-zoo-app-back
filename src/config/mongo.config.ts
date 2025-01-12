import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

// Charger les variables d'environnement
dotenv.config({ path: './.env' });

const mongoUri =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/arcadia_db';

/**
 * Fonction pour établir une connexion avec MongoDB.
 */
export const connectMongoDB = async () => {
  try {
    console.log("Tentative de connexion à MongoDB avec l'URI:", mongoUri);
    await mongoose.connect(mongoUri, {
      connectTimeoutMS: 30000,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority',
    });
    console.log('Connexion à MongoDB réussie');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB :', error);
    if (error.name === 'MongoServerError') {
      console.error("Code d'erreur:", error.code);
      console.error("Message d'erreur:", error.errmsg);
    }
    process.exit(1);
  }
};
