CREATE TABLE IF NOT EXISTS alumni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES founders(id) ON DELETE CASCADE,
  graduation_date DATE NOT NULL, cohort_id UUID REFERENCES cohorts(id),
  program_type TEXT CHECK (program_type IN ('incubator','accelerator')),
  current_status TEXT CHECK (current_status IN ('active','scaling','pivoted','closed','lost_touch')),
  venture_outcome TEXT, revenue_range TEXT, employees_count INTEGER,
  is_success_story BOOLEAN DEFAULT FALSE,
  last_contact_at TIMESTAMPTZ, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
