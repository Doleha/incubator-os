CREATE TABLE IF NOT EXISTS board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('chair','vice_chair','treasurer','secretary','member')),
  committee TEXT, term_start DATE, term_end DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','term_ending','inactive')),
  notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
