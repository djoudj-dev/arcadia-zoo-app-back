import { Model, Schema } from 'mongoose';

// Définition du schéma pour la gestion de l'alimentation des animaux
const animalFeedingManagementSchemaDefinition = {
  // Identifiant unique auto-incrémenté
  id_feeding: { type: Number, unique: true },
  // ID de l'animal concerné
  animal_id: { type: Number, required: true },
  // Date du repas
  feeding_date: { type: Date, required: true },
  // Type de nourriture
  food_type: { type: String, required: true },
  // Quantité donnée
  quantity: { type: Number, required: true },
  // Unité de mesure (g, kg, etc.)
  unit: { type: String, required: true },
  // Commentaires éventuels
  notes: { type: String },
  // ID de l'utilisateur PostgreSQL
  user_id: { type: Number, required: true },
  user_name: { type: String, required: true },
  // ID de l'employé responsable
  employe_id: { type: Number, required: true },
  // Statut du repas (planifié, effectué, annulé)
  status: {
    type: String,
    enum: ['planned', 'completed', 'cancelled'],
    default: 'planned',
  },
};

// Options de configuration du schéma
const schemaOptions = {
  collection: 'animal_feeding_management',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

export const AnimalFeedingManagementSchema = new Schema(
  animalFeedingManagementSchemaDefinition,
  schemaOptions,
);

// Index sur id_feeding pour optimiser les recherches
AnimalFeedingManagementSchema.index({ id_feeding: 1 });

// Fonction pour générer un nouvel id_feeding
async function generateIdFeeding(this: any): Promise<number> {
  try {
    const model = this.constructor as Model<any>;
    const lastDoc = await model
      .findOne()
      .sort({ id_feeding: -1 })
      .select('id_feeding')
      .exec();

    return lastDoc ? (lastDoc.id_feeding || 0) + 1 : 1;
  } catch (error) {
    console.error('Erreur lors de la génération de id_feeding:', error);
    return 1;
  }
}

// Middleware pour générer automatiquement id_feeding
AnimalFeedingManagementSchema.pre('save', async function (next) {
  if (!this.id_feeding) {
    this.id_feeding = await generateIdFeeding.call(this);
  }
  next();
});
