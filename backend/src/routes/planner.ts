import { FastifyInstance } from 'fastify';
import { Clothing } from '../models/Clothing.js';
import { OutfitHistory } from '../models/OutfitHistory.js';
import { computeHarmony, generateDripScore, generateStyleExplanation } from '../lib/colorHarmony.js';

interface OutfitCandidate {
  hoodie: { id: string; name: string; primaryHex: string; brand: string; wearCount: number };
  shorts: { id: string; name: string; primaryHex: string; brand: string; wearCount: number };
  harmonyScore: number;
  dripScore: number;
  harmonyType: string;
  explanation: string;
}

function getDayOfWeek(date: Date): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
}

function generateOutfit(
  hoodies: Array<{ _id: string; name: string; primaryHex: string; brand: string; wearCount: number }>,
  shorts: Array<{ _id: string; name: string; primaryHex: string; brand: string; wearCount: number }>,
  dayOfWeek: string,
  excludeHoodies: string[] = [],
  excludeShorts: string[] = []
): OutfitCandidate | null {
  const availableHoodies = hoodies.filter(h => !excludeHoodies.includes(h._id.toString()));
  const availableShorts = shorts.filter(s => !excludeShorts.includes(s._id.toString()));
  
  if (availableHoodies.length === 0 || availableShorts.length === 0) {
    // Fallback: use all items if we've excluded too many
    const fallbackHoodies = availableHoodies.length > 0 ? availableHoodies : hoodies;
    const fallbackShorts = availableShorts.length > 0 ? availableShorts : shorts;
    if (fallbackHoodies.length === 0 || fallbackShorts.length === 0) return null;
  }
  
  const finalHoodies = availableHoodies.length > 0 ? availableHoodies : hoodies;
  const finalShorts = availableShorts.length > 0 ? availableShorts : shorts;
  
  let bestOutfit: OutfitCandidate | null = null;
  let bestScore = -1;
  
  // Evaluate all combinations and pick the best
  for (const hoodie of finalHoodies) {
    for (const shortItem of finalShorts) {
      const harmony = computeHarmony(hoodie.primaryHex, shortItem.primaryHex);
      // Variety bonus: less-worn items get a boost
      const varietyBonus = Math.max(0, 100 - (hoodie.wearCount + shortItem.wearCount) * 5);
      const dripScore = generateDripScore(harmony.score, varietyBonus);
      const totalScore = harmony.score * 0.6 + varietyBonus * 0.3 + Math.random() * 10;
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestOutfit = {
          hoodie: { id: hoodie._id.toString(), name: hoodie.name, primaryHex: hoodie.primaryHex, brand: hoodie.brand, wearCount: hoodie.wearCount },
          shorts: { id: shortItem._id.toString(), name: shortItem.name, primaryHex: shortItem.primaryHex, brand: shortItem.brand, wearCount: shortItem.wearCount },
          harmonyScore: harmony.score,
          dripScore,
          harmonyType: harmony.type,
          explanation: generateStyleExplanation(hoodie.primaryHex, shortItem.primaryHex, harmony, dayOfWeek)
        };
      }
    }
  }
  
  return bestOutfit;
}

export async function plannerRoutes(app: FastifyInstance) {
  // Generate daily outfit
  app.post('/daily', async (_request, reply) => {
    try {
      const hoodies = await Clothing.find({ userId: 'james', type: 'hoodie' }).lean();
      const shorts = await Clothing.find({ userId: 'james', type: 'shorts' }).lean();
      
      if (hoodies.length === 0 || shorts.length === 0) {
        return reply.status(400).send({ 
          error: 'Need at least 1 hoodie and 1 shorts to generate an outfit',
          hoodies: hoodies.length,
          shorts: shorts.length
        });
      }
      
      const today = new Date();
      const dayOfWeek = getDayOfWeek(today);
      const outfit = generateOutfit(
        hoodies.map(h => ({ _id: h._id.toString(), name: h.name, primaryHex: h.primaryHex, brand: h.brand || '', wearCount: h.wearCount })),
        shorts.map(s => ({ _id: s._id.toString(), name: s.name, primaryHex: s.primaryHex, brand: s.brand || '', wearCount: s.wearCount })),
        dayOfWeek
      );
      
      if (!outfit) {
        return reply.status(400).send({ error: 'Could not generate outfit' });
      }
      
      return { date: today.toISOString(), dayOfWeek, outfit };
    } catch {
      return reply.status(500).send({ error: 'Failed to generate daily outfit' });
    }
  });

  // Generate weekly outfits (Mon-Fri)
  app.post('/week', async (_request, reply) => {
    try {
      const hoodies = await Clothing.find({ userId: 'james', type: 'hoodie' }).lean();
      const shorts = await Clothing.find({ userId: 'james', type: 'shorts' }).lean();
      
      if (hoodies.length === 0 || shorts.length === 0) {
        return reply.status(400).send({ 
          error: 'Need at least 1 hoodie and 1 shorts',
          hoodies: hoodies.length,
          shorts: shorts.length
        });
      }
      
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const weekOutfits: OutfitCandidate[] = [];
      const usedHoodies: string[] = [];
      const usedShorts: string[] = [];
      
      const hoodieData = hoodies.map(h => ({ _id: h._id.toString(), name: h.name, primaryHex: h.primaryHex, brand: h.brand || '', wearCount: h.wearCount }));
      const shortsData = shorts.map(s => ({ _id: s._id.toString(), name: s.name, primaryHex: s.primaryHex, brand: s.brand || '', wearCount: s.wearCount }));
      
      for (const day of days) {
        // Exclude shorts that have already been used twice
        const excludedShorts = usedShorts.filter(
          (id, _, arr) => arr.filter(s => s === id).length >= 2
        );
        const outfit = generateOutfit(hoodieData, shortsData, day, usedHoodies, [...new Set(excludedShorts)]);
        if (outfit) {
          weekOutfits.push(outfit);
          usedHoodies.push(outfit.hoodie.id);
          usedShorts.push(outfit.shorts.id);
        }
      }
      
      return { 
        week: days.map((day, i) => ({
          day,
          outfit: weekOutfits[i] || null
        }))
      };
    } catch {
      return reply.status(500).send({ error: 'Failed to generate weekly plan' });
    }
  });

  // Log outfit as worn
  app.post('/wear', async (request, reply) => {
    const body = request.body as {
      hoodieId: string;
      shortsId: string;
      harmonyScore: number;
      dripScore: number;
    };
    
    try {
      const history = await OutfitHistory.create({
        userId: 'james',
        hoodieId: body.hoodieId,
        shortsId: body.shortsId,
        harmonyScore: body.harmonyScore,
        dripScore: body.dripScore,
        date: new Date(),
        worn: true
      });
      
      // Increment wear counts
      await Clothing.findByIdAndUpdate(body.hoodieId, { $inc: { wearCount: 1 }, lastWorn: new Date() });
      await Clothing.findByIdAndUpdate(body.shortsId, { $inc: { wearCount: 1 }, lastWorn: new Date() });
      
      return reply.status(201).send(history);
    } catch {
      return reply.status(500).send({ error: 'Failed to log outfit' });
    }
  });
}
