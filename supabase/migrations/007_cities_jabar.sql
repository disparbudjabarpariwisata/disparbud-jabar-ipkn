-- ============================================================
-- Migration 007: Cities of Jawa Barat
-- ============================================================

CREATE TABLE IF NOT EXISTS cities_jabar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE cities_jabar ENABLE ROW LEVEL SECURITY;

-- Public & authenticated can read active cities
CREATE POLICY "cities_jabar_public_read" ON cities_jabar
  FOR SELECT TO anon USING (active = true);

CREATE POLICY "cities_jabar_authenticated_read" ON cities_jabar
  FOR SELECT TO authenticated USING (true);

-- Admin only CUD
CREATE POLICY "cities_jabar_admin_insert" ON cities_jabar
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "cities_jabar_admin_update" ON cities_jabar
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "cities_jabar_admin_delete" ON cities_jabar
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

-- ============================================================
-- Seed Data (27 Kota/Kabupaten)
-- ============================================================

INSERT INTO cities_jabar (name, sort_order) VALUES
  ('Kabupaten Bogor', 1),
  ('Kabupaten Sukabumi', 2),
  ('Kabupaten Cianjur', 3),
  ('Kabupaten Bandung', 4),
  ('Kabupaten Garut', 5),
  ('Kabupaten Tasikmalaya', 6),
  ('Kabupaten Ciamis', 7),
  ('Kabupaten Kuningan', 8),
  ('Kabupaten Cirebon', 9),
  ('Kabupaten Majalengka', 10),
  ('Kabupaten Sumedang', 11),
  ('Kabupaten Indramayu', 12),
  ('Kabupaten Subang', 13),
  ('Kabupaten Purwakarta', 14),
  ('Kabupaten Karawang', 15),
  ('Kabupaten Bekasi', 16),
  ('Kabupaten Bandung Barat', 17),
  ('Kabupaten Pangandaran', 18),
  ('Kota Bogor', 19),
  ('Kota Sukabumi', 20),
  ('Kota Bandung', 21),
  ('Kota Cirebon', 22),
  ('Kota Bekasi', 23),
  ('Kota Depok', 24),
  ('Kota Cimahi', 25),
  ('Kota Tasikmalaya', 26),
  ('Kota Banjar', 27);
