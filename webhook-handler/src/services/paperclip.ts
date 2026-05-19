import axios from 'axios';

const client = axios.create({
  baseURL: process.env.PAPERCLIP_API_URL ?? 'http://localhost:3100',
  headers: { Authorization: `Bearer ${process.env.PAPERCLIP_API_KEY}` },
  timeout: 15000,
});

export async function createTask(payload: Record<string, unknown>): Promise<{ id: string }> {
  const res = await client.post('/api/issues', payload);
  return res.data;
}
