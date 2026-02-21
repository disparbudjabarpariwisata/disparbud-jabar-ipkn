-- ============================================================
-- Migration 017: Fix Supabase Advisor security warnings
-- ============================================================
-- 1. Fix function search_path on get_survey_session_by_pin
-- 2. Tighten DELETE policies to admin-only (check email in JWT)
-- NOTE: anon INSERT policies are intentionally permissive
--       (anonymous survey respondents register without login)

-- ============================================================
-- FIX 1: Function search_path
-- ============================================================
CREATE OR REPLACE FUNCTION get_survey_session_by_pin(
  p_email text,
  p_pin text,
  p_role_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  IF p_role_type = 'Perangkat Daerah Provinsi Jawa Barat' THEN
    SELECT row_to_json(r) INTO v_result FROM public.survey_perangkat_daerah r WHERE email = p_email AND pin = p_pin LIMIT 1;
  ELSIF p_role_type = 'Instansi Pemerintah Terkait' THEN
    SELECT row_to_json(r) INTO v_result FROM public.survey_pemerintah_terkait r WHERE email = p_email AND pin = p_pin LIMIT 1;
  ELSIF p_role_type = 'Instansi / Lembaga Swasta Terkait' THEN
    SELECT row_to_json(r) INTO v_result FROM public.survey_swasta_terkait r WHERE email = p_email AND pin = p_pin LIMIT 1;
  ELSIF p_role_type = 'Komunitas / Asosiasi' THEN
    SELECT row_to_json(r) INTO v_result FROM public.survey_komunitas r WHERE email = p_email AND pin = p_pin LIMIT 1;
  ELSIF p_role_type = 'Pelaku Usaha Pariwisata / Ekraf' THEN
    SELECT row_to_json(r) INTO v_result FROM public.survey_pelaku_usaha r WHERE email = p_email AND pin = p_pin LIMIT 1;
  ELSIF p_role_type = 'Pemerintah Daerah Kota/Kabupaten Jawa Barat' THEN
    SELECT row_to_json(r) INTO v_result FROM public.survey_pemda_kabkota r WHERE email = p_email AND pin = p_pin LIMIT 1;
  ELSIF p_role_type = 'Pemerintah Pusat' THEN
    SELECT row_to_json(r) INTO v_result FROM public.survey_pemerintah_pusat r WHERE email = p_email AND pin = p_pin LIMIT 1;
  ELSIF p_role_type = 'Internasional Tourism Institution' THEN
    SELECT row_to_json(r) INTO v_result FROM public.survey_international_tourism r WHERE email = p_email AND pin = p_pin LIMIT 1;
  ELSE
    v_result := NULL;
  END IF;

  RETURN v_result;
END;
$$;

-- ============================================================
-- FIX 2: Tighten DELETE policies to admin-email only
-- ============================================================
-- Drop overly permissive DELETE policies from migration 016
DROP POLICY IF EXISTS "survey_answers_admin_delete" ON survey_answers;
DROP POLICY IF EXISTS "survey_perangkat_daerah_admin_delete" ON survey_perangkat_daerah;
DROP POLICY IF EXISTS "survey_pemerintah_terkait_admin_delete" ON survey_pemerintah_terkait;
DROP POLICY IF EXISTS "survey_swasta_terkait_admin_delete" ON survey_swasta_terkait;
DROP POLICY IF EXISTS "survey_komunitas_admin_delete" ON survey_komunitas;
DROP POLICY IF EXISTS "survey_pelaku_usaha_admin_delete" ON survey_pelaku_usaha;
DROP POLICY IF EXISTS "survey_pemda_kabkota_admin_delete" ON survey_pemda_kabkota;
DROP POLICY IF EXISTS "survey_pemerintah_pusat_admin_delete" ON survey_pemerintah_pusat;
DROP POLICY IF EXISTS "survey_international_tourism_admin_delete" ON survey_international_tourism;

-- Re-create with admin email check
CREATE POLICY "survey_answers_admin_delete" ON survey_answers
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "survey_perangkat_daerah_admin_delete" ON survey_perangkat_daerah
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "survey_pemerintah_terkait_admin_delete" ON survey_pemerintah_terkait
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "survey_swasta_terkait_admin_delete" ON survey_swasta_terkait
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "survey_komunitas_admin_delete" ON survey_komunitas
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "survey_pelaku_usaha_admin_delete" ON survey_pelaku_usaha
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "survey_pemda_kabkota_admin_delete" ON survey_pemda_kabkota
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "survey_pemerintah_pusat_admin_delete" ON survey_pemerintah_pusat
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "survey_international_tourism_admin_delete" ON survey_international_tourism
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');
