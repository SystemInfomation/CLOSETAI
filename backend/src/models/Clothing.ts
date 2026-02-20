import mongoose, { Schema, Document } from 'mongoose';

export interface IClothing extends Document {
  userId: string;
  type: 'hoodie' | 'shorts';
  name: string;
  brand: string;
  primaryHex: string;
  palette: string[];
  imageUrls: string[];
  wearCount: number;
  lastWorn: Date | null;
  tags: string[];
  createdAt: Date;
}

const clothingSchema = new Schema<IClothing>({
  userId: { type: String, required: true, default: 'james' },
  type: { type: String, enum: ['hoodie', 'shorts'], required: true },
  name: { type: String, required: true },
  brand: { type: String, default: '' },
  primaryHex: { type: String, required: true },
  palette: [{ type: String }],
  imageUrls: [{ type: String }],
  wearCount: { type: Number, default: 0 },
  lastWorn: { type: Date, default: null },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

clothingSchema.index({ userId: 1, type: 1 });
clothingSchema.index({ primaryHex: 1 });

export const Clothing = mongoose.model<IClothing>('Clothing', clothingSchema);
