CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
  notes_ai TEXT, notes_human TEXT,
  outcome TEXT CHECK (outcome IN ('productive','needs_followup','missed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
