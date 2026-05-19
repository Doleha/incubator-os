CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  role TEXT NOT NULL, department TEXT,
  start_date DATE, end_date DATE, hours_committed INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
