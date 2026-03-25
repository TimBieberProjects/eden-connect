-- EDEN Connect — Patients & Consultations (Lightweight EMR)

CREATE TABLE IF NOT EXISTS patients (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  dob            DATE,
  sex            TEXT CHECK (sex IN ('male', 'female', 'other')),
  village        TEXT,
  community_id   UUID REFERENCES communities(id) ON DELETE SET NULL,
  phone          TEXT,
  guardian_name  TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id          UUID REFERENCES patients(id) ON DELETE CASCADE,
  consulted_at        TIMESTAMPTZ DEFAULT NOW(),
  chief_complaint     TEXT,
  subjective          TEXT,
  objective           TEXT,
  assessment          TEXT,
  plan                TEXT,
  ai_diagnosis        TEXT,
  ai_treatment        TEXT,
  ai_classification   TEXT CHECK (ai_classification IN ('PINK', 'YELLOW', 'GREEN')),
  referral_required   BOOLEAN DEFAULT FALSE,
  raw_input           TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read patients"
  ON patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert patients"
  ON patients FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients"
  ON patients FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read consultations"
  ON consultations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert consultations"
  ON consultations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update consultations"
  ON consultations FOR UPDATE TO authenticated USING (true);
