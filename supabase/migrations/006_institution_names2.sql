-- ============================================================
-- Migration 006: Institution Names 2 (Instansi Terkait)
-- ============================================================

CREATE TABLE IF NOT EXISTS institution_names2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE institution_names2 ENABLE ROW LEVEL SECURITY;

-- Public & authenticated can read active institutions
DROP POLICY IF EXISTS "institution_names2_public_read" ON institution_names2;
CREATE POLICY "institution_names2_public_read" ON institution_names2
  FOR SELECT TO anon USING (active = true);

DROP POLICY IF EXISTS "institution_names2_authenticated_read" ON institution_names2;
CREATE POLICY "institution_names2_authenticated_read" ON institution_names2
  FOR SELECT TO authenticated USING (true);

-- Admin only CUD
DROP POLICY IF EXISTS "institution_names2_admin_insert" ON institution_names2;
CREATE POLICY "institution_names2_admin_insert" ON institution_names2
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

DROP POLICY IF EXISTS "institution_names2_admin_update" ON institution_names2;
CREATE POLICY "institution_names2_admin_update" ON institution_names2
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

DROP POLICY IF EXISTS "institution_names2_admin_delete" ON institution_names2;
CREATE POLICY "institution_names2_admin_delete" ON institution_names2
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

-- ============================================================
-- Seed Data
-- ============================================================

INSERT INTO institution_names2 (category, name, sort_order) VALUES
  -- 1) Instansi vertikal Pemerintah Pusat (K/L) di tingkat provinsi
  ('INSTANSI VERTIKAL PEMERINTAH PUSAT', 'Kanwil Kementerian Agama (Kemenag) Provinsi Jawa Barat', 10),
  ('INSTANSI VERTIKAL PEMERINTAH PUSAT', 'Kanwil Kementerian Hukum (Kemenkum) Jawa Barat', 11),
  ('INSTANSI VERTIKAL PEMERINTAH PUSAT', 'Kanwil Kementerian ATR/BPN (BPN) Provinsi Jawa Barat', 12),
  ('INSTANSI VERTIKAL PEMERINTAH PUSAT', 'Kanwil Direktorat Jenderal Bea dan Cukai (DJBC) Jawa Barat – Kemenkeu', 13),
  ('INSTANSI VERTIKAL PEMERINTAH PUSAT', 'Kanwil Direktorat Jenderal Pajak (DJP) Jawa Barat I – Kemenkeu', 14),
  ('INSTANSI VERTIKAL PEMERINTAH PUSAT', 'Kanwil Direktorat Jenderal Perbendaharaan (DJPb) Provinsi Jawa Barat – Kemenkeu', 15),

  -- 2) Penegak hukum & keamanan (tingkat provinsi)
  ('PENEGAK HUKUM & KEAMANAN', 'Kepolisian Daerah (Polda) Jawa Barat', 20),
  ('PENEGAK HUKUM & KEAMANAN', 'Kejaksaan Tinggi (Kejati) Jawa Barat', 21),
  ('PENEGAK HUKUM & KEAMANAN', 'Komando Daerah Militer III/Siliwangi (Kodam III/Siliwangi)', 22),

  -- 3) Lembaga peradilan (tingkat provinsi)
  ('LEMBAGA PERADILAN', 'Pengadilan Tinggi Bandung (wilayah Jawa Barat)', 30),

  -- 4) Lembaga negara/otoritas sektor (perwakilan di daerah)
  ('LEMBAGA NEGARA/OTORITAS SEKTOR', 'Kantor Perwakilan Bank Indonesia Provinsi Jawa Barat', 40),
  ('LEMBAGA NEGARA/OTORITAS SEKTOR', 'Kantor OJK Provinsi Jawa Barat', 41)
ON CONFLICT (name) DO UPDATE SET 
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order;
