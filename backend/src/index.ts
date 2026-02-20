import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { connectDB } from './db.js';
import { clothingRoutes } from './routes/clothing.js';
import { plannerRoutes } from './routes/planner.js';
import { analyticsRoutes } from './routes/analytics.js';

const app = Fastify({ logger: true });

app.register(cors, { origin: true });
app.register(helmet);

app.register(clothingRoutes, { prefix: '/api/clothing' });
app.register(plannerRoutes, { prefix: '/api/planner' });
app.register(analyticsRoutes, { prefix: '/api/analytics' });

app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

const start = async () => {
  try {
    await connectDB();
    await app.listen({ port: Number(process.env.PORT) || 4000, host: '0.0.0.0' });
    console.log('JamesFit AI Backend running on port 4000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
