import type { FastifyInstance } from 'fastify';
import axios from 'axios';

const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL ?? '';

export default async function outboundRoutes(app: FastifyInstance) {
  app.post<{ Body: Record<string, unknown> }>('/bridge/outbound', async (req, reply) => {
    if (!n8nWebhookUrl) {
      app.log.warn('N8N_WEBHOOK_URL not configured — outbound event dropped');
      return reply.send({ ok: true, forwarded: false });
    }

    try {
      await axios.post(n8nWebhookUrl, req.body, { timeout: 10000 });
      reply.send({ ok: true, forwarded: true });
    } catch (err) {
      app.log.error({ err }, 'Failed to forward event to n8n');
      reply.status(502).send({ error: 'Failed to forward to n8n' });
    }
  });
}
