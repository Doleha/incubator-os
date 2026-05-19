import Fastify from 'fastify';
import cors from '@fastify/cors';
import outboundRoutes from './routes/outbound.js';
import inboundRoutes from './routes/inbound.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: false });
await app.register(outboundRoutes);
await app.register(inboundRoutes);

app.get('/health', async () => ({ ok: true }));

const port = parseInt(process.env.N8N_BRIDGE_PORT ?? '3300');
await app.listen({ port, host: '0.0.0.0' });
