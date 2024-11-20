import { Schema } from 'mongoose';

export const ParkStatusSchema = new Schema(
  {
    _id: { type: String },
    isOpen: { type: Boolean, required: true },
    message: { type: String },
  },
  {
    _id: false,
    timestamps: true,
    collection: 'park_status',
    versionKey: false,
  },
);
