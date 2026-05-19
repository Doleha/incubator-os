CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL, phone TEXT,
  skills TEXT[] DEFAULT '{}',
  availability TEXT CHECK (availability IN ('weekdays','weekends','evenings','flexible')),
  hours_per_week INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','pending')),
  joined_at DATE, notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
