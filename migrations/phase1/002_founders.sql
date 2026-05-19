CREATE TABLE IF NOT EXISTS founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL, phone TEXT,
  path TEXT CHECK (path IN ('incubator','accelerator')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','active','graduated','withdrawn','rejected')),
  cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL,
  readiness_score INTEGER CHECK (readiness_score BETWEEN 0 AND 100),
  at_risk BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
