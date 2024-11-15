import { Model, Schema } from 'mongoose';

// Définition du schéma pour les avis utilisateurs
const userOpinionsSchemaDefinition = {
  // Identifiant unique auto-incrémenté pour chaque avis
  id_opinion: { type: Number, unique: true },
  // Nom de l'utilisateur qui a donné l'avis
  name: { type: String, required: true },
  // Date de création de l'avis (format string)
  date: { type: String, required: true },
  // Contenu du message/commentaire
  message: { type: String, required: true },
  // Note donnée par l'utilisateur (entre 0 et 5)
  rating: { type: Number, required: true, min: 0, max: 5 },
  // Indique si l'avis a été accepté par un modérateur
  accepted: { type: Boolean, default: false },
  // Indique si l'avis a été validé selon les critères
  validated: { type: Boolean, default: false },
  // Date de publication de l'avis
  published_at: { type: Date },
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

// Création d'un index sur id_opinion pour optimiser les recherches
UserOpinionsSchema.index({ id_opinion: 1 });

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
