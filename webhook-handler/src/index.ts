import Fastify from 'fastify';
import cors from '@fastify/cors';
import whatsappRoutes from './routes/whatsapp.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: false });
await app.register(whatsappRoutes);

app.get('/health', async () => ({ ok: true }));

const port = parseInt(process.env.WEBHOOK_PORT ?? '3200');
await app.listen({ port, host: '0.0.0.0' });
