import axios from 'axios';

const client = axios.create({
  baseURL: process.env.PAPERCLIP_API_URL ?? 'http://localhost:3100',
  headers: { Authorization: `Bearer ${process.env.PAPERCLIP_API_KEY}` },
  timeout: 30000,
});

export const paperclipClient = {
  async requestHire(companyId: string, agentId: string, payload: Record<string, unknown>) {
    return client.post(`/api/companies/${companyId}/approvals`, {
      type: 'hire_agent',
      requestedByAgentId: agentId,
      payload,
    });
  },
  async createTask(companyId: string, payload: Record<string, unknown>) {
    return client.post(`/api/companies/${companyId}/issues`, payload);
  },
  async createGoal(companyId: string, payload: Record<string, unknown>) {
    return client.post(`/api/companies/${companyId}/goals`, payload);
  },
  async callbackSuccess(runId: string, result: string,
    usage: { inputTokens: number; outputTokens: number }, costUsd: number) {
    return client.post(`/api/heartbeat-runs/${runId}/callback`, {
      status: 'succeeded', result, usage, costUsd,
      model: 'qwen3.6:35b-a3b', provider: 'local_llm',
    });
  },
  async callbackFailure(runId: string, errorMessage: string) {
    return client.post(`/api/heartbeat-runs/${runId}/callback`, {
      status: 'failed', result: errorMessage,
    });
  },
};
