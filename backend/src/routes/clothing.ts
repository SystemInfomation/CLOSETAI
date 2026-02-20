import { FastifyInstance } from 'fastify';
import { Clothing } from '../models/Clothing.js';

const DEFAULT_USER = process.env.DEFAULT_USER || 'default';

export async function clothingRoutes(app: FastifyInstance) {
  // List all clothing with optional filters
  app.get('/', async (request, reply) => {
    const { type, tag, sort } = request.query as { type?: string; tag?: string; sort?: string };
    const filter: Record<string, unknown> = { userId: DEFAULT_USER };
    if (type) filter.type = type;
    if (tag) filter.tags = tag;
    
    const sortOption: Record<string, 1 | -1> = sort === 'lastWorn' ? { lastWorn: -1 } : { createdAt: -1 };
    
    try {
      const items = await Clothing.find(filter).sort(sortOption).lean();
      return items;
    } catch {
      return reply.status(500).send({ error: 'Failed to fetch clothing' });
    }
  });

  // Add new clothing item
  app.post('/', async (request, reply) => {
    const body = request.body as {
      type: string;
      name: string;
      brand?: string;
      primaryHex: string;
      palette?: string[];
      imageUrls?: string[];
      tags?: string[];
    };
    
    if (!body.type || !body.name || !body.primaryHex) {
      return reply.status(400).send({ error: 'type, name, and primaryHex are required' });
    }
    
    if (!['hoodie', 'shorts'].includes(body.type)) {
      return reply.status(400).send({ error: 'type must be hoodie or shorts' });
    }
    
    try {
      const item = await Clothing.create({
        userId: DEFAULT_USER,
        ...body
      });
      return reply.status(201).send(item);
    } catch {
      return reply.status(500).send({ error: 'Failed to create clothing item' });
    }
  });

  // Update clothing item
  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const updates = request.body as Record<string, unknown>;
    
    try {
      const item = await Clothing.findByIdAndUpdate(id, updates, { new: true });
      if (!item) return reply.status(404).send({ error: 'Item not found' });
      return item;
    } catch {
      return reply.status(500).send({ error: 'Failed to update clothing item' });
    }
  });

  // Delete clothing item
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      const item = await Clothing.findByIdAndDelete(id);
      if (!item) return reply.status(404).send({ error: 'Item not found' });
      return { success: true };
    } catch {
      return reply.status(500).send({ error: 'Failed to delete clothing item' });
    }
  });

  // Log wear event
  app.post('/:id/wear', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      const item = await Clothing.findByIdAndUpdate(
        id,
        { $inc: { wearCount: 1 }, lastWorn: new Date() },
        { new: true }
      );
      if (!item) return reply.status(404).send({ error: 'Item not found' });
      return item;
    } catch {
      return reply.status(500).send({ error: 'Failed to log wear' });
    }
  });
}
