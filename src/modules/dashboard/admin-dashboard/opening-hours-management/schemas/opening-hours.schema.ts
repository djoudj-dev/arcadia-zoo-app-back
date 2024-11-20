import { Schema } from 'mongoose';

export const OpeningHoursSchema = new Schema({
  openingHours: [
    {
      days: String,
      hours: String,
      isOpen: Boolean,
    },
  ],
  parkStatus: Boolean,
  statusMessage: String,
  updatedAt: { type: Date, default: Date.now },
  isCurrent: { type: Boolean, default: false },
});
