-- ============================================================
-- Migration 011: Expand Question Types & Add Conditional Logic
-- ============================================================

-- 1. Drop the restrictive CHECK constraint on question_type to allow new types
-- By default Postgres names column checks as table_column_check
ALTER TABLE survey_questions DROP CONSTRAINT IF EXISTS survey_questions_question_type_check;

-- 2. Add columns for conditional logic
ALTER TABLE survey_questions 
    ADD COLUMN IF NOT EXISTS depends_on_question_id UUID REFERENCES survey_questions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS depends_on_answer TEXT;

