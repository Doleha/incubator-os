CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('incubator','accelerator')),
  start_date DATE, end_date DATE,
  status TEXT NOT NULL DEFAULT 'forming'
    CHECK (status IN ('forming','active','completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
