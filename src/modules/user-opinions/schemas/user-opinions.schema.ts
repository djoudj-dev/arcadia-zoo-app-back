import { Model, Schema } from 'mongoose';

// Définition du schéma pour les avis utilisateurs
const userOpinionsSchemaDefinition = {
  id_opinion: { type: Number, unique: true },
  user_id: { type: Number, required: true },
  user_name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
};

// Options de configuration du schéma
const schemaOptions = {
  // Nom de la collection dans MongoDB
  collection: 'user_opinions',
  // Ajout automatique des timestamps
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

export const UserOpinionsSchema = new Schema(
  userOpinionsSchemaDefinition,
  schemaOptions,
);

// Fonction pour générer un nouvel id_opinion
async function generateIdOpinion(this: any): Promise<number> {
  try {
    const model = this.constructor as Model<any>;
    // Recherche du dernier document pour obtenir le dernier id_opinion
    const lastDoc = await model
      .findOne()
      .sort({ id_opinion: -1 })
      .select('id_opinion')
      .exec();

    // Retourne id_opinion + 1 ou 1 si aucun document n'existe
    return lastDoc ? (lastDoc.id_opinion || 0) + 1 : 1;
  } catch (error) {
    console.error('Erreur lors de la génération de id_opinion:', error);
    return 1;
  }
}

// Middleware exécuté avant la sauvegarde d'un document
UserOpinionsSchema.pre('save', async function (next) {
  // Génère un nouveau id_opinion si non défini
  if (!this.id_opinion) {
    this.id_opinion = await generateIdOpinion.call(this);
  }
  next();
});
