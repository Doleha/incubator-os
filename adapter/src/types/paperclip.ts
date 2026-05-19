// TODO: Replace with @paperclipai/adapter-utils once the package is published.
// Type stubs matching the Paperclip adapter SDK interface.

export interface AdapterExecutionContext {
  runId: string;
  agent: {
    id: string;
    name: string;
    companyId: string;
  };
  context: {
    wakeReason?: string;
    taskId?: string;
  };
  config: Record<string, unknown>;
}

export interface AdapterExecutionResult {
  exitCode: number;
  signal: null;
  timedOut: boolean;
  summary?: string;
  errorMessage?: string;
  usage?: { inputTokens: number; outputTokens: number };
  costUsd?: number;
  model?: string;
  provider?: string;
}

export interface EnvironmentCheck {
  code: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface EnvironmentTestResult {
  adapterType: string;
  status: 'pass' | 'fail';
  checks: EnvironmentCheck[];
  testedAt: string;
}

export interface ServerAdapterModule {
  type: string;
  execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult>;
  testEnvironment?(ctx: AdapterExecutionContext): Promise<EnvironmentTestResult>;
  models?: Array<{ id: string; label: string }>;
  agentConfigurationDoc?: string;
}
