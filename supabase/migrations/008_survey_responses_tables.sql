-- ============================================================
-- Migration 008: 8 Isolated Survey Response Tables
-- ============================================================

-- ==========================================
-- 1. Perangkat Daerah Provinsi Jawa Barat
-- ==========================================
CREATE TABLE IF NOT EXISTS survey_perangkat_daerah (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT DEFAULT 'Perangkat Daerah Provinsi Jawa Barat' NOT NULL,
  institution TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  pin TEXT NOT NULL,
  
  -- Tracking
  status TEXT DEFAULT 'incomplete',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: survey_perangkat_daerah
ALTER TABLE survey_perangkat_daerah ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_perangkat_daerah" ON survey_perangkat_daerah
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "anon_insert_perangkat_daerah" ON survey_perangkat_daerah
  FOR INSERT TO anon
  WITH CHECK (true);

-- ==========================================
-- 2. Instansi Pemerintah Terkait
-- ==========================================
CREATE TABLE IF NOT EXISTS survey_pemerintah_terkait (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT DEFAULT 'Instansi Pemerintah Terkait' NOT NULL,
  institution TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  pin TEXT NOT NULL,
  
  status TEXT DEFAULT 'incomplete',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: survey_pemerintah_terkait
ALTER TABLE survey_pemerintah_terkait ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_pemerintah_terkait" ON survey_pemerintah_terkait
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "anon_insert_pemerintah_terkait" ON survey_pemerintah_terkait
  FOR INSERT TO anon
  WITH CHECK (true);

-- ==========================================
-- 3. Instansi / Lembaga Swasta Terkait
-- ==========================================
CREATE TABLE IF NOT EXISTS survey_swasta_terkait (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT DEFAULT 'Instansi / Lembaga Swasta Terkait' NOT NULL,
  institution TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  pin TEXT NOT NULL,
  
  status TEXT DEFAULT 'incomplete',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: survey_swasta_terkait
ALTER TABLE survey_swasta_terkait ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_swasta_terkait" ON survey_swasta_terkait
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "anon_insert_swasta_terkait" ON survey_swasta_terkait
  FOR INSERT TO anon
  WITH CHECK (true);

-- ==========================================
-- 4. Komunitas / Asosiasi
-- ==========================================
CREATE TABLE IF NOT EXISTS survey_komunitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT DEFAULT 'Komunitas / Asosiasi' NOT NULL,
  institution TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  pin TEXT NOT NULL,
  
  status TEXT DEFAULT 'incomplete',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: survey_komunitas
ALTER TABLE survey_komunitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_komunitas" ON survey_komunitas
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "anon_insert_komunitas" ON survey_komunitas
  FOR INSERT TO anon
  WITH CHECK (true);

-- ==========================================
-- 5. Pelaku Usaha Pariwisata / Ekraf
-- ==========================================
CREATE TABLE IF NOT EXISTS survey_pelaku_usaha (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT DEFAULT 'Pelaku Usaha Pariwisata / Ekraf' NOT NULL,
  institution TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  pin TEXT NOT NULL,
  
  status TEXT DEFAULT 'incomplete',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: survey_pelaku_usaha
ALTER TABLE survey_pelaku_usaha ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_pelaku_usaha" ON survey_pelaku_usaha
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "anon_insert_pelaku_usaha" ON survey_pelaku_usaha
  FOR INSERT TO anon
  WITH CHECK (true);

-- ==========================================
-- 6. Pemerintah Daerah Kota/Kabupaten
-- ==========================================
CREATE TABLE IF NOT EXISTS survey_pemda_kabkota (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT DEFAULT 'Pemerintah Daerah Kota/Kabupaten Jawa Barat' NOT NULL,
  city TEXT NOT NULL,
  institution TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  pin TEXT NOT NULL,
  
  status TEXT DEFAULT 'incomplete',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: survey_pemda_kabkota
ALTER TABLE survey_pemda_kabkota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_pemda_kabkota" ON survey_pemda_kabkota
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "anon_insert_pemda_kabkota" ON survey_pemda_kabkota
  FOR INSERT TO anon
  WITH CHECK (true);

-- ==========================================
-- 7. Pemerintah Pusat
-- ==========================================
CREATE TABLE IF NOT EXISTS survey_pemerintah_pusat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT DEFAULT 'Pemerintah Pusat' NOT NULL,
  institution TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  pin TEXT NOT NULL,
  
  status TEXT DEFAULT 'incomplete',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: survey_pemerintah_pusat
ALTER TABLE survey_pemerintah_pusat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_pemerintah_pusat" ON survey_pemerintah_pusat
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "anon_insert_pemerintah_pusat" ON survey_pemerintah_pusat
  FOR INSERT TO anon
  WITH CHECK (true);

-- ==========================================
-- 8. Internasional Tourism Institution
-- ==========================================
CREATE TABLE IF NOT EXISTS survey_international_tourism (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT DEFAULT 'Internasional Tourism Institution' NOT NULL,
  institution TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  pin TEXT NOT NULL,
  
  status TEXT DEFAULT 'incomplete',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: survey_international_tourism
ALTER TABLE survey_international_tourism ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_international_tourism" ON survey_international_tourism
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "anon_insert_international_tourism" ON survey_international_tourism
  FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================================
-- 9. Secure PostgreSQL Functions for Resume (CRU bypassing RLS)
-- ============================================================

-- Function to safely fetch a respondent's data if Email and PIN match
-- Since they do not have JWTs, this operates with Security Definer to bypass standard RLS selectivity.
CREATE OR REPLACE FUNCTION get_survey_session_by_pin(
  p_email text,
  p_pin text,
  p_role_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  -- We match the requested role_type string to explicitly query the correct isolated table.
  IF p_role_type = 'Perangkat Daerah Provinsi Jawa Barat' THEN
    SELECT row_to_json(r) INTO v_result FROM survey_perangkat_daerah r WHERE email = p_email AND pin = p_pin LIMIT 1;
  
  ELSIF p_role_type = 'Instansi Pemerintah Terkait' THEN
    SELECT row_to_json(r) INTO v_result FROM survey_pemerintah_terkait r WHERE email = p_email AND pin = p_pin LIMIT 1;
    
  ELSIF p_role_type = 'Instansi / Lembaga Swasta Terkait' THEN
    SELECT row_to_json(r) INTO v_result FROM survey_swasta_terkait r WHERE email = p_email AND pin = p_pin LIMIT 1;
    
  ELSIF p_role_type = 'Komunitas / Asosiasi' THEN
    SELECT row_to_json(r) INTO v_result FROM survey_komunitas r WHERE email = p_email AND pin = p_pin LIMIT 1;
    
  ELSIF p_role_type = 'Pelaku Usaha Pariwisata / Ekraf' THEN
    SELECT row_to_json(r) INTO v_result FROM survey_pelaku_usaha r WHERE email = p_email AND pin = p_pin LIMIT 1;
    
  ELSIF p_role_type = 'Pemerintah Daerah Kota/Kabupaten Jawa Barat' THEN
    SELECT row_to_json(r) INTO v_result FROM survey_pemda_kabkota r WHERE email = p_email AND pin = p_pin LIMIT 1;
    
  ELSIF p_role_type = 'Pemerintah Pusat' THEN
    SELECT row_to_json(r) INTO v_result FROM survey_pemerintah_pusat r WHERE email = p_email AND pin = p_pin LIMIT 1;
    
  ELSIF p_role_type = 'Internasional Tourism Institution' THEN
    SELECT row_to_json(r) INTO v_result FROM survey_international_tourism r WHERE email = p_email AND pin = p_pin LIMIT 1;
    
  ELSE
    v_result := NULL;
  END IF;

  RETURN v_result;
END;
$$;
