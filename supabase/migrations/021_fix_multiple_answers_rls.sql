-- 021_fix_multiple_answers_rls.sql
-- Fix RLS policy so Admins can view/export multiple answers.
-- Previously it checked the profiles table, but the app uses JWT emails directly.

DROP POLICY IF EXISTS "Admins can view all multiple answers" ON public.survey_multiple_answers;
DROP POLICY IF EXISTS "admin_all_multiple_answers" ON public.survey_multiple_answers;

CREATE POLICY "admin_all_multiple_answers" ON public.survey_multiple_answers
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      'disparbudjabarpariwisata2026@gmail.com',
      'disparbudjabarpariwisata@gmail.com',
      'ainalisadata@gmail.com',
      'yusufsupriawan21@gmail.com'
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'disparbudjabarpariwisata2026@gmail.com',
      'disparbudjabarpariwisata@gmail.com',
      'ainalisadata@gmail.com',
      'yusufsupriawan21@gmail.com'
    )
  );
