-- Human approval queue. All agent recommendations requiring staff action.
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, entity_id UUID,
  department TEXT NOT NULL, agent_role TEXT NOT NULL,
  recommendation TEXT NOT NULL, reasoning TEXT, data JSONB,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  decided_by TEXT, decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS decisions_status_idx ON decisions(status);
CREATE INDEX IF NOT EXISTS decisions_dept_idx ON decisions(department);
