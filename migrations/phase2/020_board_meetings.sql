CREATE TABLE IF NOT EXISTS board_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('regular','special','annual','committee')),
  quorum_met BOOLEAN, action_items JSONB DEFAULT '[]',
  minutes_url TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
