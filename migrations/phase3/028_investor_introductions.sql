CREATE TABLE IF NOT EXISTS investor_introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  founder_id UUID NOT NULL REFERENCES founders(id) ON DELETE CASCADE,
  introduced_at DATE,
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed','made','meeting_scheduled','passed','invested')),
  notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
