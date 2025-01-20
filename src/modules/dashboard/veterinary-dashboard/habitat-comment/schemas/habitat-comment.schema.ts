import { Schema } from 'mongoose';

export const HabitatCommentSchema = new Schema(
  {
    id_habitat_comment: { type: String },
    id_habitat: { type: Number, required: true },
    habitat_name: { type: String, required: true },
    id_user: { type: Number, required: true },
    user_name: { type: String, required: true },
    comment: { type: String, required: true },
    habitat_status: {
      type: String,
      required: true,
      enum: ['Optimal', 'Acceptable', 'Nécessite des améliorations'],
    },
    is_resolved: { type: Boolean, default: false },
    resolved_at: { type: Date },
    resolved_by: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);
