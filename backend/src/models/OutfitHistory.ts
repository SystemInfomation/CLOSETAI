import mongoose, { Schema, Document } from 'mongoose';

export interface IOutfitHistory extends Document {
  userId: string;
  hoodieId: string;
  shortsId: string;
  harmonyScore: number;
  dripScore: number;
  date: Date;
  rating: number | null;
  worn: boolean;
}

const outfitHistorySchema = new Schema<IOutfitHistory>({
  userId: { type: String, required: true, default: 'default' },
  hoodieId: { type: String, required: true },
  shortsId: { type: String, required: true },
  harmonyScore: { type: Number, required: true },
  dripScore: { type: Number, required: true },
  date: { type: Date, required: true },
  rating: { type: Number, default: null },
  worn: { type: Boolean, default: false }
});

outfitHistorySchema.index({ userId: 1, date: -1 });

export const OutfitHistory = mongoose.model<IOutfitHistory>('OutfitHistory', outfitHistorySchema);
