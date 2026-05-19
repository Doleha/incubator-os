CREATE TABLE IF NOT EXISTS corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  quality_assessment_id UUID REFERENCES quality_assessments(id),
  root_cause TEXT NOT NULL CHECK (root_cause IN (
    'instructions_quality','capacity_overload','data_quality',
    'scope_too_wide','model_ceiling','unknown'
  )),
  action_type TEXT NOT NULL CHECK (action_type IN (
    'update_instructions','hire_worker','reduce_scope',
    'fix_data','split_role','pause_agent','escalate_human'
  )),
  action_description TEXT NOT NULL,
  suggested_instructions_update TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('minor','moderate','critical')),
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  escalation_level TEXT NOT NULL DEFAULT 'director'
    CHECK (escalation_level IN ('director','executive_director','board')),
  implemented_by TEXT,
  implemented_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','implemented','verified','failed','escalated')),
  outcome TEXT CHECK (outcome IN ('improved','no_change','degraded')),
  verification_run_ids TEXT[],
  cycle_count INTEGER NOT NULL DEFAULT 0,
  board_notified_at TIMESTAMPTZ,
  board_notification_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ca_agent_idx ON corrective_actions(agent_id);
CREATE INDEX IF NOT EXISTS ca_status_idx ON corrective_actions(status);
CREATE INDEX IF NOT EXISTS ca_escalation_idx ON corrective_actions(escalation_level);
