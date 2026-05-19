CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year INTEGER NOT NULL, quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
  category TEXT NOT NULL, line_item TEXT NOT NULL,
  budgeted_usd INTEGER NOT NULL DEFAULT 0,
  actual_usd INTEGER NOT NULL DEFAULT 0, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
