-- ============================================================
-- Migration 012: Allow authenticated users to INSERT survey answers
-- ============================================================

-- The existing policy only allows 'anon' to insert.
-- Logged-in users (authenticated) also need to submit survey answers.
CREATE POLICY "authenticated_insert_survey_answers" ON survey_answers
  FOR INSERT TO authenticated
  WITH CHECK (true);
