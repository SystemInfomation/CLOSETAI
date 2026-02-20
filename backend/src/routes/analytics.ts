import { FastifyInstance } from 'fastify';
import { Clothing } from '../models/Clothing.js';
import { OutfitHistory } from '../models/OutfitHistory.js';

export async function analyticsRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    try {
      const hoodies = await Clothing.find({ userId: 'james', type: 'hoodie' }).lean();
      const shorts = await Clothing.find({ userId: 'james', type: 'shorts' }).lean();
      const history = await OutfitHistory.find({ userId: 'james' }).sort({ date: -1 }).limit(30).lean();
      
      const totalItems = hoodies.length + shorts.length;
      const totalWears = history.length;
      const avgHarmony = history.length > 0
        ? Math.round(history.reduce((sum, h) => sum + h.harmonyScore, 0) / history.length)
        : 0;
      const avgDrip = history.length > 0
        ? Math.round(history.reduce((sum, h) => sum + h.dripScore, 0) / history.length)
        : 0;
      
      // Calculate streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const hasOutfit = history.some(h => {
          const d = new Date(h.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === checkDate.getTime();
        });
        if (hasOutfit) streak++;
        else break;
      }
      
      // Most worn items
      const mostWornHoodie = hoodies.sort((a, b) => b.wearCount - a.wearCount)[0] || null;
      const mostWornShorts = shorts.sort((a, b) => b.wearCount - a.wearCount)[0] || null;
      
      // Color distribution
      const colorFamilies: Record<string, number> = { cool: 0, warm: 0, neutral: 0, earth: 0 };
      [...hoodies, ...shorts].forEach(item => {
        const hex = item.primaryHex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const saturation = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
        if (saturation < 0.15) colorFamilies.neutral++;
        else if (b > r && b > g) colorFamilies.cool++;
        else if (r > b) colorFamilies.warm++;
        else colorFamilies.earth++;
      });
      
      return {
        totalItems,
        hoodies: hoodies.length,
        shorts: shorts.length,
        totalWears,
        avgHarmony,
        avgDrip,
        streak,
        mostWornHoodie,
        mostWornShorts,
        colorFamilies,
        recentHistory: history.slice(0, 10)
      };
    } catch {
      return reply.status(500).send({ error: 'Failed to fetch analytics' });
    }
  });
}
