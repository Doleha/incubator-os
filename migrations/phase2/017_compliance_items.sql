CREATE TABLE IF NOT EXISTS compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'irs_990','state_filing','grant_report','board_meeting',
    'policy_renewal','audit','insurance','other'
  )),
  due_date DATE NOT NULL, description TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','completed','overdue')),
  assigned_to TEXT, notes TEXT,
  recurrence TEXT CHECK (recurrence IN ('annual','quarterly','monthly','one_time')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS compliance_due_date_idx ON compliance_items(due_date ASC);
