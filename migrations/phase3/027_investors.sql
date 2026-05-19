CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL, firm TEXT, title TEXT,
  focus_areas TEXT[] DEFAULT '{}', stage_preference TEXT[] DEFAULT '{}',
  check_size_min_usd INTEGER, check_size_max_usd INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  last_contact_at TIMESTAMPTZ, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
