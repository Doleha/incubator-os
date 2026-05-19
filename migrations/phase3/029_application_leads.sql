CREATE TABLE IF NOT EXISTS application_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT, last_name TEXT, email TEXT, phone TEXT,
  venture_name TEXT, sector TEXT, source TEXT,
  stage TEXT CHECK (stage IN ('identified','contacted','interested','applied')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
