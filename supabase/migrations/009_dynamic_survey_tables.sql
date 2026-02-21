-- ============================================================
-- Migration 009: Dynamic Survey Questions and Answers Tables
-- ============================================================

-- ==========================================
-- 1. survey_questions
-- ==========================================
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES role_types(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'textarea', 'radio', 'checkbox', 'dropdown', 'number')),
  options JSONB, -- For storing choices if type is radio, checkbox, or dropdown (e.g., ["Option 1", "Option 2"])
  is_required BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: survey_questions
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "admin_all_survey_questions" ON survey_questions
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

-- Public and authenticated users can only READ active questions globally
CREATE POLICY "public_read_survey_questions" ON survey_questions
  FOR SELECT TO anon, authenticated
  USING (active = true);


-- ==========================================
-- 2. survey_answers
-- ==========================================
CREATE TABLE IF NOT EXISTS survey_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  respondent_id UUID NOT NULL, -- UUID from one of the 8 identity tables 
  role_id UUID NOT NULL REFERENCES role_types(id) ON DELETE CASCADE, -- Denormalized for fast filtering
  question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  answer_text TEXT, -- For text, textarea, radio, dropdown, number
  answer_json JSONB, -- For checkbox (multiple selections)
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create an index to speed up filtering answers by respondent
CREATE INDEX IF NOT EXISTS idx_survey_answers_respondent ON survey_answers(respondent_id);

-- RLS: survey_answers
ALTER TABLE survey_answers ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "admin_all_survey_answers" ON survey_answers
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

-- Public (Respondents) can ONLY INSERT their own answers
CREATE POLICY "anon_insert_survey_answers" ON survey_answers
  FOR INSERT TO anon
  WITH CHECK (true);

-- (Optional: For "Resume Session" updates, we may add RLS or an RPC function later, 
-- but normally answers are dumped during the final submit).

-- ============================================================
-- Note: You should seed demo questions down the line using the Admin Dashboard.
-- ============================================================
