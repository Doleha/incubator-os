CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES founders(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  program_type TEXT CHECK (program_type IN ('incubator','accelerator')),
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed','active','completed','terminated')),
  session_count INTEGER NOT NULL DEFAULT 0,
  match_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
