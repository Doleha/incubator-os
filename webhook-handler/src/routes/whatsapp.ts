import type { FastifyInstance } from 'fastify';
import { createTask } from '../services/paperclip.js';
import { sendMessage } from '../services/evolution.js';

type EvolutionPayload = {
  data?: {
    key?: { remoteJid?: string; id?: string };
    message?: { conversation?: string; extendedTextMessage?: { text?: string } };
  };
};

function extractPhone(jid: string): string {
  return jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
}

function extractText(payload: EvolutionPayload): string {
  return (
    payload.data?.message?.conversation ??
    payload.data?.message?.extendedTextMessage?.text ??
    ''
  );
}

export default async function whatsappRoutes(app: FastifyInstance) {
  app.post<{ Body: EvolutionPayload }>('/webhook/whatsapp', async (req, reply) => {
    reply.send({ ok: true }); // respond immediately — 200 before any processing

    const jid = req.body?.data?.key?.remoteJid ?? '';
    const messageId = req.body?.data?.key?.id ?? '';
    const phone = extractPhone(jid);
    const message = extractText(req.body);

    if (!phone || !message) return;

    try {
      await createTask({
        title: `WhatsApp message from ${phone}`,
        description: message,
        source: 'whatsapp',
        metadata: { phone, messageId, rawJid: jid },
        priority: 'high',
        tags: ['whatsapp', 'intake'],
      });
    } catch (err) {
      app.log.error({ err, phone }, 'Failed to create Paperclip task for WhatsApp message');
    }
  });

  app.post<{ Body: { phone: string; message: string } }>('/webhook/whatsapp/reply', async (req, reply) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return reply.status(400).send({ error: 'phone and message are required' });
    }

    try {
      await sendMessage(phone, message);
      reply.send({ ok: true });
    } catch (err) {
      app.log.error({ err, phone }, 'Failed to send WhatsApp reply');
      reply.status(500).send({ error: 'Failed to send message' });
    }
  });
}
