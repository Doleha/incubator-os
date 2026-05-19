CREATE TABLE IF NOT EXISTS quality_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performance_id UUID NOT NULL REFERENCES agent_performance(id),
  agent_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  semantic_score INTEGER CHECK (semantic_score BETWEEN 0 AND 100),
  reasoning_specific BOOLEAN,
  output_actionable BOOLEAN,
  findings TEXT,
  reviewed_by TEXT NOT NULL DEFAULT 'quality-assurance-manager',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS qa_agent_idx ON quality_assessments(agent_id);
