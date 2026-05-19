CREATE TABLE IF NOT EXISTS donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL, phone TEXT,
  giving_tier TEXT CHECK (giving_tier IN ('friend','supporter','champion','major','board')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','lapsed','inactive')),
  first_gift_at DATE, last_gift_at DATE,
  total_given_usd INTEGER NOT NULL DEFAULT 0, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
