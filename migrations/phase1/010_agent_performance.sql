-- Written by local_llm adapter after every agent run.
CREATE TABLE IF NOT EXISTS agent_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  auto_score INTEGER NOT NULL CHECK (auto_score BETWEEN 0 AND 100),
  fields_complete BOOLEAN NOT NULL,
  reasoning_present BOOLEAN NOT NULL,
  entities_count INTEGER NOT NULL DEFAULT 0,
  flags TEXT[] NOT NULL DEFAULT '{}',
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS perf_agent_idx ON agent_performance(agent_id);
CREATE INDEX IF NOT EXISTS perf_date_idx ON agent_performance(created_at DESC);
CREATE INDEX IF NOT EXISTS perf_score_idx ON agent_performance(auto_score);
