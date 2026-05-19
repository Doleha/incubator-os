CREATE TABLE IF NOT EXISTS donor_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  amount_usd INTEGER NOT NULL, gift_date DATE NOT NULL,
  gift_type TEXT CHECK (gift_type IN ('one_time','recurring','major','in_kind')),
  campaign TEXT, acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
