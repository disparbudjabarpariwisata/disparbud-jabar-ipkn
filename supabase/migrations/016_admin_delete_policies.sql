-- ============================================================
-- Migration 016: Add DELETE RLS policies for admin cleanup
-- ============================================================
-- Allows authenticated users (admin) to delete respondent records
-- and their survey answers for cleanup purposes.

-- survey_answers: allow authenticated delete
CREATE POLICY "survey_answers_admin_delete" ON survey_answers
  FOR DELETE TO authenticated
  USING (true);

-- All 8 survey registration tables
CREATE POLICY "survey_perangkat_daerah_admin_delete" ON survey_perangkat_daerah
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "survey_pemerintah_terkait_admin_delete" ON survey_pemerintah_terkait
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "survey_swasta_terkait_admin_delete" ON survey_swasta_terkait
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "survey_komunitas_admin_delete" ON survey_komunitas
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "survey_pelaku_usaha_admin_delete" ON survey_pelaku_usaha
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "survey_pemda_kabkota_admin_delete" ON survey_pemda_kabkota
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "survey_pemerintah_pusat_admin_delete" ON survey_pemerintah_pusat
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "survey_international_tourism_admin_delete" ON survey_international_tourism
  FOR DELETE TO authenticated USING (true);
