CREATE TABLE IF NOT EXISTS mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  expertise TEXT[] NOT NULL DEFAULT '{}',
  program_type TEXT CHECK (program_type IN ('incubator','accelerator','both')),
  bio TEXT,
  availability TEXT CHECK (availability IN ('high','medium','low')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
