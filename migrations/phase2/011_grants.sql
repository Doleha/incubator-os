CREATE TABLE IF NOT EXISTS grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funder TEXT NOT NULL, title TEXT NOT NULL,
  amount_usd INTEGER, deadline DATE, report_due_date DATE,
  status TEXT NOT NULL DEFAULT 'researching'
    CHECK (status IN ('researching','drafting','submitted','awarded','rejected','archived')),
  requirements TEXT, notes TEXT, source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
