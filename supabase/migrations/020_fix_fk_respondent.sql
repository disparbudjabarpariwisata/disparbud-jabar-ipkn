-- 020_fix_fk_respondent.sql
-- Drop foreign key constraint fk_respondent on survey_multiple_answers
-- Reason: respondent_id references survey-specific tables (e.g. survey_perangkat_daerah),
-- NOT profiles table. This FK was incorrectly set during table creation.

ALTER TABLE public.survey_multiple_answers DROP CONSTRAINT IF EXISTS fk_respondent;

-- Also check and fix survey_answers if it has the same issue
ALTER TABLE public.survey_answers DROP CONSTRAINT IF EXISTS survey_answers_respondent_id_fkey;
ALTER TABLE public.survey_answers DROP CONSTRAINT IF EXISTS fk_respondent;
