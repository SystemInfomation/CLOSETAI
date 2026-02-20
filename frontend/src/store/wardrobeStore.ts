import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { computeHarmony, generateDripScore, generateStyleExplanation } from '@/lib/colorHarmony';

export interface ClothingItem {
  id: string;
  type: 'hoodie' | 'shorts';
  name: string;
  brand: string;
  primaryHex: string;
  palette: string[];
  imageUrls: string[];
  wearCount: number;
  lastWorn: string | null;
  tags: string[];
  createdAt: string;
}

export interface Outfit {
  hoodie: ClothingItem;
  shorts: ClothingItem;
  harmonyScore: number;
  dripScore: number;
  harmonyType: string;
  explanation: string;
  date: string;
  dayOfWeek: string;
}

export interface OutfitHistoryEntry {
  outfit: Outfit;
  rating: number | null;
  worn: boolean;
  date: string;
}

interface WardrobeState {
  items: ClothingItem[];
  outfitHistory: OutfitHistoryEntry[];
  streak: number;
  lastStreakDate: string | null;

  addItem: (item: Omit<ClothingItem, 'id' | 'wearCount' | 'lastWorn' | 'createdAt'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ClothingItem>) => void;
  
  generateDailyOutfit: () => Outfit | null;
  generateWeeklyOutfits: () => Outfit[];
  
  wearOutfit: (outfit: Outfit) => void;
  rateOutfit: (date: string, rating: number) => void;
  
  getHoodies: () => ClothingItem[];
  getShorts: () => ClothingItem[];
}

function getDayOfWeek(date: Date): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Seed data
const SEED_DATA: Omit<ClothingItem, 'id' | 'wearCount' | 'lastWorn' | 'createdAt'>[] = [
  { type: 'hoodie', name: 'Nike Tech Fleece Black', brand: 'Nike', primaryHex: '#1a1a1a', palette: ['#1a1a1a', '#333333', '#4d4d4d'], imageUrls: [], tags: ['school-safe', 'gym-only', 'favorite'] },
  { type: 'hoodie', name: 'Jordan Essentials Gray', brand: 'Jordan', primaryHex: '#808080', palette: ['#808080', '#999999', '#666666'], imageUrls: [], tags: ['school-safe'] },
  { type: 'hoodie', name: 'Nike Tech Fleece Navy', brand: 'Nike', primaryHex: '#1b2a4a', palette: ['#1b2a4a', '#2d4373', '#0f1d33'], imageUrls: [], tags: ['school-safe', 'favorite'] },
  { type: 'hoodie', name: 'Champion Reverse Weave Forest', brand: 'Champion', primaryHex: '#2d5a27', palette: ['#2d5a27', '#3d7a37', '#1d3a17'], imageUrls: [], tags: ['school-safe'] },
  { type: 'hoodie', name: 'Under Armour Storm Crimson', brand: 'Under Armour', primaryHex: '#8b0000', palette: ['#8b0000', '#a52a2a', '#660000'], imageUrls: [], tags: ['gym-only'] },
  { type: 'hoodie', name: 'Nike Club Fleece White', brand: 'Nike', primaryHex: '#f0f0f0', palette: ['#f0f0f0', '#e0e0e0', '#ffffff'], imageUrls: [], tags: ['school-safe', 'new-drop'] },
  { type: 'hoodie', name: 'Jordan Flight Heritage Teal', brand: 'Jordan', primaryHex: '#008080', palette: ['#008080', '#20b2aa', '#005f5f'], imageUrls: [], tags: ['school-safe', 'favorite'] },
  { type: 'hoodie', name: 'Nike Sportswear Charcoal', brand: 'Nike', primaryHex: '#36454f', palette: ['#36454f', '#4a5c6a', '#2a3640'], imageUrls: [], tags: ['school-safe'] },
  { type: 'shorts', name: 'Nike Dri-FIT Black Shorts', brand: 'Nike', primaryHex: '#111111', palette: ['#111111', '#222222', '#333333'], imageUrls: [], tags: ['gym-only', 'school-safe', 'favorite'] },
  { type: 'shorts', name: 'Jordan Mesh Basketball Red', brand: 'Jordan', primaryHex: '#cc0000', palette: ['#cc0000', '#ff0000', '#990000'], imageUrls: [], tags: ['gym-only'] },
  { type: 'shorts', name: 'Nike Tech Fleece Gray Shorts', brand: 'Nike', primaryHex: '#6b6b6b', palette: ['#6b6b6b', '#858585', '#525252'], imageUrls: [], tags: ['school-safe'] },
  { type: 'shorts', name: 'Under Armour Cargo Olive', brand: 'Under Armour', primaryHex: '#556b2f', palette: ['#556b2f', '#6b8e23', '#3d4f22'], imageUrls: [], tags: ['school-safe'] },
  { type: 'shorts', name: 'Champion Classic Navy Shorts', brand: 'Champion', primaryHex: '#1c2951', palette: ['#1c2951', '#2a3d6e', '#131c38'], imageUrls: [], tags: ['school-safe'] },
  { type: 'shorts', name: 'Nike Sportswear White Shorts', brand: 'Nike', primaryHex: '#e8e8e8', palette: ['#e8e8e8', '#d4d4d4', '#f5f5f5'], imageUrls: [], tags: ['school-safe', 'new-drop'] },
  { type: 'shorts', name: 'Jordan Dri-FIT Teal Shorts', brand: 'Jordan', primaryHex: '#20b2aa', palette: ['#20b2aa', '#3cb3ad', '#178f89'], imageUrls: [], tags: ['gym-only', 'new-drop'] }
];

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set, get) => ({
      items: SEED_DATA.map(item => ({
        ...item,
        id: generateId(),
        wearCount: 0,
        lastWorn: null,
        createdAt: new Date().toISOString()
      })),
      outfitHistory: [],
      streak: 0,
      lastStreakDate: null,

      addItem: (item) => {
        const newItem: ClothingItem = {
          ...item,
          id: generateId(),
          wearCount: 0,
          lastWorn: null,
          createdAt: new Date().toISOString()
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter(i => i.id !== id) }));
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map(i => i.id === id ? { ...i, ...updates } : i)
        }));
      },

      generateDailyOutfit: () => {
        const state = get();
        const hoodies = state.items.filter(i => i.type === 'hoodie');
        const shorts = state.items.filter(i => i.type === 'shorts');
        
        if (hoodies.length === 0 || shorts.length === 0) return null;
        
        const today = new Date();
        const dayOfWeek = getDayOfWeek(today);
        
        let bestOutfit: Outfit | null = null;
        let bestScore = -1;
        
        for (const hoodie of hoodies) {
          for (const shortItem of shorts) {
            const harmony = computeHarmony(hoodie.primaryHex, shortItem.primaryHex);
            const varietyBonus = Math.max(0, 100 - (hoodie.wearCount + shortItem.wearCount) * 5);
            const dripScore = generateDripScore(harmony.score, varietyBonus);
            const totalScore = harmony.score * 0.6 + varietyBonus * 0.3 + Math.random() * 10;
            
            if (totalScore > bestScore) {
              bestScore = totalScore;
              bestOutfit = {
                hoodie,
                shorts: shortItem,
                harmonyScore: harmony.score,
                dripScore,
                harmonyType: harmony.type,
                explanation: generateStyleExplanation(hoodie.primaryHex, shortItem.primaryHex, harmony, dayOfWeek),
                date: today.toISOString(),
                dayOfWeek
              };
            }
          }
        }
        
        return bestOutfit;
      },

      generateWeeklyOutfits: () => {
        const state = get();
        const hoodies = state.items.filter(i => i.type === 'hoodie');
        const shorts = state.items.filter(i => i.type === 'shorts');
        
        if (hoodies.length === 0 || shorts.length === 0) return [];
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const outfits: Outfit[] = [];
        const usedHoodieIds: string[] = [];
        
        for (const day of days) {
          const availableHoodies = hoodies.filter(h => !usedHoodieIds.includes(h.id));
          const useHoodies = availableHoodies.length > 0 ? availableHoodies : hoodies;
          
          let bestOutfit: Outfit | null = null;
          let bestScore = -1;
          
          for (const hoodie of useHoodies) {
            for (const shortItem of shorts) {
              const harmony = computeHarmony(hoodie.primaryHex, shortItem.primaryHex);
              const varietyBonus = Math.max(0, 100 - (hoodie.wearCount + shortItem.wearCount) * 5);
              const totalScore = harmony.score * 0.6 + varietyBonus * 0.3 + Math.random() * 10;
              
              if (totalScore > bestScore) {
                bestScore = totalScore;
                bestOutfit = {
                  hoodie,
                  shorts: shortItem,
                  harmonyScore: harmony.score,
                  dripScore: generateDripScore(harmony.score, varietyBonus),
                  harmonyType: harmony.type,
                  explanation: generateStyleExplanation(hoodie.primaryHex, shortItem.primaryHex, harmony, day),
                  date: new Date().toISOString(),
                  dayOfWeek: day
                };
              }
            }
          }
          
          if (bestOutfit) {
            outfits.push(bestOutfit);
            usedHoodieIds.push(bestOutfit.hoodie.id);
          }
        }
        
        return outfits;
      },

      wearOutfit: (outfit) => {
        const today = new Date().toISOString().split('T')[0];
        
        set((state) => {
          const newHistory: OutfitHistoryEntry = {
            outfit,
            rating: null,
            worn: true,
            date: new Date().toISOString()
          };
          
          // Update streak
          let newStreak = state.streak;
          const lastDate = state.lastStreakDate;
          if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            newStreak = lastDate === yesterdayStr ? state.streak + 1 : 1;
          }
          
          return {
            items: state.items.map(item => {
              if (item.id === outfit.hoodie.id || item.id === outfit.shorts.id) {
                return { ...item, wearCount: item.wearCount + 1, lastWorn: new Date().toISOString() };
              }
              return item;
            }),
            outfitHistory: [newHistory, ...state.outfitHistory],
            streak: newStreak,
            lastStreakDate: today
          };
        });
      },

      rateOutfit: (date, rating) => {
        set((state) => ({
          outfitHistory: state.outfitHistory.map(entry =>
            entry.date === date ? { ...entry, rating } : entry
          )
        }));
      },

      getHoodies: () => get().items.filter(i => i.type === 'hoodie'),
      getShorts: () => get().items.filter(i => i.type === 'shorts'),
    }),
    {
      name: 'jamesfit-wardrobe',
    }
  )
);
