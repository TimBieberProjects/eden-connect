-- EDEN Connect — Initial Schema
-- Nickson's five-level reporting hierarchy: Province → District → LLG → Health Facility → Community

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- HIERARCHY TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS provinces (
  id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS districts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, province_id)
);

CREATE TABLE IF NOT EXISTS llgs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, district_id)
);

CREATE TABLE IF NOT EXISTS agencies (
  id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_facilities (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  llg_id     UUID NOT NULL REFERENCES llgs(id) ON DELETE CASCADE,
  agency_id  UUID REFERENCES agencies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, llg_id)
);

CREATE TABLE IF NOT EXISTS communities (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  health_facility_id  UUID NOT NULL REFERENCES health_facilities(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, health_facility_id)
);

-- ============================================================
-- BASELINE SURVEYS
-- One survey per community per survey phase
-- ============================================================

CREATE TABLE IF NOT EXISTS baseline_surveys (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Hierarchy refs
  community_id         UUID NOT NULL REFERENCES communities(id),
  health_facility_id   UUID NOT NULL REFERENCES health_facilities(id),
  llg_id               UUID NOT NULL REFERENCES llgs(id),
  agency_id            UUID NOT NULL REFERENCES agencies(id),

  -- Survey metadata
  submitted_at         TIMESTAMPTZ,
  survey_phase         TEXT,
  coordinator_name     TEXT,
  officer_name         TEXT,
  person_interviewed   TEXT,
  phone_number         TEXT,
  role_in_community    TEXT,

  -- Community governance
  ward_development_plan              BOOLEAN,
  ward_development_committee_active  BOOLEAN,
  training_conducted_last_2_years    BOOLEAN,
  training_organisation              TEXT,
  assistance_from_llg_government     BOOLEAN,
  community_general_look             TEXT,
  community_described_as_healthy     BOOLEAN,
  common_illnesses                   TEXT,
  disease_numbers_changed            BOOLEAN,

  -- Housing
  bush_material_houses   INTEGER,
  semi_permanent_houses  INTEGER,
  permanent_houses       INTEGER,

  -- Sanitation
  septic_toilets         INTEGER,
  pit_toilets            INTEGER,
  rubbish_pits           INTEGER,
  dish_racks             INTEGER,
  separated_kitchens     INTEGER,
  hand_washing_dishes    INTEGER,
  faith_gardens          INTEGER,

  -- Population
  children_under_1yr    INTEGER,
  children_1_5yrs       INTEGER,
  children_6_14yrs      INTEGER,
  people_15_49yrs       INTEGER,
  people_50yrs_plus     INTEGER,
  total_population      INTEGER,
  total_households      INTEGER,

  -- Deaths (past year)
  deaths_babies_under_1yr          INTEGER,
  deaths_children_1_5yrs           INTEGER,
  deaths_children_over_5_adults    INTEGER,
  deaths_women_childbirth          INTEGER,

  -- Disease burden
  outpatient_total_last_year          INTEGER,
  outpatient_total_this_year_to_date  INTEGER,
  malaria_cases_this_year             INTEGER,
  pneumonia_cases_this_year           INTEGER,
  simple_cough_cases_this_year        INTEGER,
  skin_disease_cases_this_year        INTEGER,
  diarrhea_cases_this_year            INTEGER,
  malnutrition_cases_this_year        INTEGER,

  -- Water & education
  water_source                              TEXT,
  water_fetch_time_minutes                  INTEGER,
  water_source_reliable_extreme_weather     BOOLEAN,
  distance_to_school_km                     NUMERIC(6,2),
  education_no_formal                       INTEGER,
  education_primary_complete                INTEGER,
  education_high_school                     INTEGER,
  education_secondary                       INTEGER,
  education_tertiary                        INTEGER,

  -- Sync tracking
  sheets_row_index  INTEGER,
  synced_at         TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(community_id, survey_phase)
);

-- ============================================================
-- QUARTERLY REPORTS
-- One report per health facility per quarter
-- ============================================================

CREATE TABLE IF NOT EXISTS quarterly_reports (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Hierarchy refs
  health_facility_id   UUID NOT NULL REFERENCES health_facilities(id),
  llg_id               UUID NOT NULL REFERENCES llgs(id),
  agency_id            UUID NOT NULL REFERENCES agencies(id),

  -- Report metadata
  submitted_at          TIMESTAMPTZ,
  reporting_quarter     TEXT,
  date_report_submitted DATE,
  compiled_by           TEXT,
  coordinator_name      TEXT,

  -- EDEN program status
  attended_eden_tot_training  BOOLEAN,
  tot_training_year           TEXT,
  annual_implementation_plan  BOOLEAN,
  monthly_grant_allocated     BOOLEAN,
  eden_rolled_out             BOOLEAN,
  num_facilities_rolling_out  INTEGER,

  -- Disease: Malaria
  malaria_cases        INTEGER,
  malaria_trend        TEXT,
  malaria_explanation  TEXT,
  malaria_rdt_cases        INTEGER,
  malaria_rdt_trend        TEXT,
  malaria_rdt_explanation  TEXT,

  -- Disease: Diarrhea
  diarrhea_cases        INTEGER,
  diarrhea_trend        TEXT,
  diarrhea_explanation  TEXT,

  -- Disease: Skin Disease
  skin_disease_cases        INTEGER,
  skin_disease_trend        TEXT,
  skin_disease_explanation  TEXT,

  -- Disease: Simple Cough
  simple_cough_cases        INTEGER,
  simple_cough_trend        TEXT,
  simple_cough_explanation  TEXT,

  -- Disease: Pneumonia
  pneumonia_cases        INTEGER,
  pneumonia_trend        TEXT,
  pneumonia_explanation  TEXT,

  -- Outpatient
  outpatient_total        INTEGER,
  outpatient_trend        TEXT,
  outpatient_explanation  TEXT,

  -- Community progress
  total_communities_reached          INTEGER,
  villages_declared_healthy          INTEGER,
  healthy_village_names              TEXT,
  villages_working_towards_healthy   INTEGER,
  villages_working_names             TEXT,
  healthy_families_declared          INTEGER,
  new_villages_currently_working_with INTEGER,

  -- Infrastructure built this quarter
  new_permanent_houses        INTEGER,
  new_semi_permanent_houses   INTEGER,
  new_bush_material_houses    INTEGER,
  new_pit_toilets             INTEGER,
  new_vip_toilets             INTEGER,
  new_rubbish_pits            INTEGER,
  new_roof_catchment_water    INTEGER,
  new_dish_racks              INTEGER,
  new_separated_kitchens      INTEGER,
  new_hand_washing_dishes     INTEGER,
  new_faith_gardens           INTEGER,

  -- Notes
  advice_required  TEXT,
  other_comments   TEXT,

  -- Sync tracking
  sheets_row_index  INTEGER,
  synced_at         TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(health_facility_id, reporting_quarter)
);

-- ============================================================
-- SYNC RUNS
-- Track every sync execution for auditability
-- ============================================================

CREATE TABLE IF NOT EXISTS sync_runs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sheet_name      TEXT NOT NULL,
  sheet_id        TEXT NOT NULL,
  rows_processed  INTEGER DEFAULT 0,
  rows_inserted   INTEGER DEFAULT 0,
  rows_updated    INTEGER DEFAULT 0,
  status          TEXT NOT NULL CHECK (status IN ('running', 'success', 'error')),
  error_message   TEXT,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

-- ============================================================
-- VIEWS — flatten hierarchy for easy querying
-- ============================================================

CREATE OR REPLACE VIEW v_baseline_surveys AS
SELECT
  bs.*,
  c.name   AS community_name,
  hf.name  AS facility_name,
  l.name   AS llg_name,
  d.name   AS district_name,
  p.name   AS province_name,
  a.name   AS agency_name
FROM baseline_surveys bs
JOIN communities      c  ON c.id  = bs.community_id
JOIN health_facilities hf ON hf.id = bs.health_facility_id
JOIN llgs              l  ON l.id  = hf.llg_id
JOIN districts         d  ON d.id  = l.district_id
JOIN provinces         p  ON p.id  = d.province_id
JOIN agencies          a  ON a.id  = bs.agency_id;

CREATE OR REPLACE VIEW v_quarterly_reports AS
SELECT
  qr.*,
  hf.name  AS facility_name,
  l.name   AS llg_name,
  d.name   AS district_name,
  p.name   AS province_name,
  a.name   AS agency_name
FROM quarterly_reports qr
JOIN health_facilities hf ON hf.id = qr.health_facility_id
JOIN llgs              l  ON l.id  = hf.llg_id
JOIN districts         d  ON d.id  = l.district_id
JOIN provinces         p  ON p.id  = d.province_id
JOIN agencies          a  ON a.id  = qr.agency_id;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE provinces         ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE llgs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE baseline_surveys  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs         ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all health data
CREATE POLICY "authenticated_read_all" ON provinces         FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON districts         FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON llgs              FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON agencies          FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON health_facilities FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON communities       FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON baseline_surveys  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON quarterly_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_all" ON sync_runs         FOR SELECT TO authenticated USING (true);

-- Service role (sync script) can write everything
CREATE POLICY "service_write_all" ON provinces         FOR ALL TO service_role USING (true);
CREATE POLICY "service_write_all" ON districts         FOR ALL TO service_role USING (true);
CREATE POLICY "service_write_all" ON llgs              FOR ALL TO service_role USING (true);
CREATE POLICY "service_write_all" ON agencies          FOR ALL TO service_role USING (true);
CREATE POLICY "service_write_all" ON health_facilities FOR ALL TO service_role USING (true);
CREATE POLICY "service_write_all" ON communities       FOR ALL TO service_role USING (true);
CREATE POLICY "service_write_all" ON baseline_surveys  FOR ALL TO service_role USING (true);
CREATE POLICY "service_write_all" ON quarterly_reports FOR ALL TO service_role USING (true);
CREATE POLICY "service_write_all" ON sync_runs         FOR ALL TO service_role USING (true);
