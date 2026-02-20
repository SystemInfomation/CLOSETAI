import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Clothing } from './models/Clothing.js';

dotenv.config();

const seedData = [
  // Hoodies (8)
  { type: 'hoodie', name: 'Nike Tech Fleece Black', brand: 'Nike', primaryHex: '#1a1a1a', palette: ['#1a1a1a', '#333333', '#4d4d4d'], tags: ['school-safe', 'gym-only', 'favorite'] },
  { type: 'hoodie', name: 'Jordan Essentials Gray', brand: 'Jordan', primaryHex: '#808080', palette: ['#808080', '#999999', '#666666'], tags: ['school-safe'] },
  { type: 'hoodie', name: 'Nike Tech Fleece Navy', brand: 'Nike', primaryHex: '#1b2a4a', palette: ['#1b2a4a', '#2d4373', '#0f1d33'], tags: ['school-safe', 'favorite'] },
  { type: 'hoodie', name: 'Champion Reverse Weave Forest', brand: 'Champion', primaryHex: '#2d5a27', palette: ['#2d5a27', '#3d7a37', '#1d3a17'], tags: ['school-safe'] },
  { type: 'hoodie', name: 'Under Armour Storm Crimson', brand: 'Under Armour', primaryHex: '#8b0000', palette: ['#8b0000', '#a52a2a', '#660000'], tags: ['gym-only'] },
  { type: 'hoodie', name: 'Nike Club Fleece White', brand: 'Nike', primaryHex: '#f0f0f0', palette: ['#f0f0f0', '#e0e0e0', '#ffffff'], tags: ['school-safe', 'new-drop'] },
  { type: 'hoodie', name: 'Jordan Flight Heritage Teal', brand: 'Jordan', primaryHex: '#008080', palette: ['#008080', '#20b2aa', '#005f5f'], tags: ['school-safe', 'favorite'] },
  { type: 'hoodie', name: 'Nike Sportswear Charcoal', brand: 'Nike', primaryHex: '#36454f', palette: ['#36454f', '#4a5c6a', '#2a3640'], tags: ['school-safe'] },
  // Shorts (7)
  { type: 'shorts', name: 'Nike Dri-FIT Black Shorts', brand: 'Nike', primaryHex: '#111111', palette: ['#111111', '#222222', '#333333'], tags: ['gym-only', 'school-safe', 'favorite'] },
  { type: 'shorts', name: 'Jordan Mesh Basketball Red', brand: 'Jordan', primaryHex: '#cc0000', palette: ['#cc0000', '#ff0000', '#990000'], tags: ['gym-only'] },
  { type: 'shorts', name: 'Nike Tech Fleece Gray Shorts', brand: 'Nike', primaryHex: '#6b6b6b', palette: ['#6b6b6b', '#858585', '#525252'], tags: ['school-safe'] },
  { type: 'shorts', name: 'Under Armour Cargo Olive', brand: 'Under Armour', primaryHex: '#556b2f', palette: ['#556b2f', '#6b8e23', '#3d4f22'], tags: ['school-safe'] },
  { type: 'shorts', name: 'Champion Classic Navy Shorts', brand: 'Champion', primaryHex: '#1c2951', palette: ['#1c2951', '#2a3d6e', '#131c38'], tags: ['school-safe'] },
  { type: 'shorts', name: 'Nike Sportswear White Shorts', brand: 'Nike', primaryHex: '#e8e8e8', palette: ['#e8e8e8', '#d4d4d4', '#f5f5f5'], tags: ['school-safe', 'new-drop'] },
  { type: 'shorts', name: 'Jordan Dri-FIT Teal Shorts', brand: 'Jordan', primaryHex: '#20b2aa', palette: ['#20b2aa', '#3cb3ad', '#178f89'], tags: ['gym-only', 'new-drop'] }
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/closetai';
  const userId = process.env.DEFAULT_USER || 'default';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  
  await Clothing.deleteMany({ userId });
  console.log('Cleared existing data');
  
  for (const item of seedData) {
    await Clothing.create({ userId, ...item });
  }
  
  console.log(`Seeded ${seedData.length} items for user "${userId}"`);
  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(console.error);
