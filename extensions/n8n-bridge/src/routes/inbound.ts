import type { FastifyInstance } from 'fastify';
import axios from 'axios';

type InboundPayload = {
  task_id: string;
  status: 'completed' | 'failed' | 'needs_review';
  result?: string;
  trigger_next_agent?: boolean;
};

const paperclipClient = axios.create({
  baseURL: process.env.PAPERCLIP_API_URL ?? 'http://localhost:3100',
  headers: { Authorization: `Bearer ${process.env.PAPERCLIP_API_KEY}` },
  timeout: 15000,
});

export default async function inboundRoutes(app: FastifyInstance) {
  app.post<{ Body: InboundPayload }>('/bridge/inbound', async (req, reply) => {
    const { task_id, status, result, trigger_next_agent } = req.body;

    if (!task_id || !status) {
      return reply.status(400).send({ error: 'task_id and status are required' });
    }

    try {
      await paperclipClient.patch(`/api/issues/${task_id}`, {
        status: status === 'completed' ? 'done' : status === 'failed' ? 'cancelled' : 'in_progress',
        result,
      });

      if (trigger_next_agent) {
        await paperclipClient.post(`/api/issues/${task_id}/trigger-next`, {});
      }

      reply.send({ ok: true });
    } catch (err) {
      app.log.error({ err, task_id }, 'Failed to update Paperclip task from n8n result');
      reply.status(500).send({ error: 'Failed to update task' });
    }
  });
}
