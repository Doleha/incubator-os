CREATE TABLE IF NOT EXISTS ventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES founders(id) ON DELETE CASCADE,
  name TEXT NOT NULL, sector TEXT,
  stage TEXT CHECK (stage IN ('idea','validation','mvp','growth')),
  description TEXT,
  readiness_score INTEGER CHECK (readiness_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
