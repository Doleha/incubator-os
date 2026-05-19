import axios from 'axios';

const client = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: { apikey: process.env.EVOLUTION_API_KEY },
  timeout: 15000,
});

const instance = process.env.EVOLUTION_INSTANCE_NAME ?? 'default';

export async function sendMessage(phone: string, message: string): Promise<void> {
  await client.post(`/message/sendText/${instance}`, {
    number: phone,
    textMessage: { text: message },
  });
}
