-- ============================================================
-- Migration 013: Add institution_name to survey_questions
-- ============================================================
-- This allows questions to be targeted to specific institutions
-- within a role category (e.g. "Dinas Pariwisata" within 
-- "Perangkat Daerah Provinsi Jawa Barat")

ALTER TABLE survey_questions 
  ADD COLUMN IF NOT EXISTS institution_name TEXT;
