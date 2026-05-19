CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'demo_day','workshop','networking','board_meeting',
    'cohort_kickoff','graduation','fundraiser','community','other'
  )),
  date TIMESTAMPTZ, location TEXT, virtual_link TEXT, description TEXT,
  rsvp_count INTEGER DEFAULT 0, capacity INTEGER,
  logistics_checklist JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning','confirmed','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
