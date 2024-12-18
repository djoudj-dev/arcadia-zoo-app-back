import { Schema } from 'mongoose';

export const VeterinaryReportsSchema = new Schema(
  {
    id_veterinary_reports: { type: String },
    id_animal: { type: Number, required: true },
    animal_name: { type: String, required: true },
    id_user: { type: Number, required: true },
    user_name: { type: String, required: true },

    visit_date: { type: Date, required: true },
    animal_state: {
      type: String,
      required: true,
      enum: ['Bonne santé', 'Blessé', 'Malade'],
    },

    recommended_food_type: { type: String, required: true },
    recommended_food_quantity: { type: Number, required: true },
    food_unit: {
      type: String,
      required: true,
      enum: ['g', 'kg'],
    },

    additional_details: { type: String },

    is_processed: { type: Boolean, default: false },
    is_treated: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);
