CREATE TABLE IF NOT EXISTS program_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID REFERENCES founders(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL,
  program_type TEXT CHECK (program_type IN ('incubator','accelerator')),
  survey_type TEXT NOT NULL CHECK (survey_type IN ('mid_program','end_program','quarterly','exit')),
  nps_score INTEGER CHECK (nps_score BETWEEN 0 AND 10),
  strengths TEXT, improvements TEXT,
  mentor_rating INTEGER CHECK (mentor_rating BETWEEN 1 AND 5),
  program_rating INTEGER CHECK (program_rating BETWEEN 1 AND 5),
  would_recommend BOOLEAN,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
