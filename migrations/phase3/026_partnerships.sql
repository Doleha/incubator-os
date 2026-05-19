CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'university','government','nonprofit','foundation','ecosystem_org','media','other'
  )),
  contact_name TEXT, contact_email TEXT, value_provided TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('prospecting','active','stale','inactive')),
  last_touchpoint_at TIMESTAMPTZ, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
