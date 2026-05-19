CREATE TABLE IF NOT EXISTS corporate_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL, contact_name TEXT, contact_email TEXT,
  sponsorship_level TEXT CHECK (sponsorship_level IN ('bronze','silver','gold','platinum','title')),
  amount_usd INTEGER, benefits_agreed TEXT, benefits_delivered TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('prospecting','active','renewal','lapsed','inactive')),
  contract_start DATE, contract_end DATE, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
