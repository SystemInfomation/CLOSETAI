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
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set, get) => ({
      items: [],
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
      name: 'closetai-wardrobe',
    }
  )
);
