-- Append-only audit log and report store.
CREATE TABLE IF NOT EXISTS events_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  entity_type TEXT, entity_id UUID,
  payload JSONB,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS events_log_type_idx ON events_log(type);
CREATE INDEX IF NOT EXISTS events_log_date_idx ON events_log(created_at DESC);
