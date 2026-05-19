CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN (
    'newsletter','social_post','announcement','donor_update','press_release','founder_message'
  )),
  title TEXT NOT NULL, content TEXT NOT NULL, target_audience TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','approved','rejected','sent')),
  approved_by TEXT, approved_at TIMESTAMPTZ, sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
