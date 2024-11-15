import { Schema } from 'mongoose';

export const UserOpinionsSchema = new Schema(
  {
    name: { type: String, required: true },
    date: { type: String, required: true },
    message: { type: String, required: true },
    rating: { type: Number, required: true },
    accepted: { type: Boolean, default: false },
    validated: { type: Boolean, default: false },
    published_at: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'user_opinions',
    timestamps: true,
    strict: true,
    versionKey: false,
  },
);

UserOpinionsSchema.index({ validated: 1 });

UserOpinionsSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});
