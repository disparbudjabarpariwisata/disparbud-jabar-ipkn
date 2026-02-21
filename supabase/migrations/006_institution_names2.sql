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
CREATE POLICY "institution_names2_public_read" ON institution_names2
  FOR SELECT TO anon USING (active = true);

CREATE POLICY "institution_names2_authenticated_read" ON institution_names2
  FOR SELECT TO authenticated USING (true);

-- Admin only CUD
CREATE POLICY "institution_names2_admin_insert" ON institution_names2
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "institution_names2_admin_update" ON institution_names2
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "institution_names2_admin_delete" ON institution_names2
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

-- ============================================================
-- Seed Data
-- ============================================================

INSERT INTO institution_names2 (category, name, sort_order) VALUES
  -- 1) Instansi vertikal Pemerintah Pusat (K/L) di tingkat provinsi
  ('Instansi vertikal Pemerintah Pusat', 'Kanwil Kementerian Agama (Kemenag) Provinsi Jawa Barat', 10),
  ('Instansi vertikal Pemerintah Pusat', 'Kanwil Kementerian Hukum (Kemenkum) Jawa Barat', 11),
  ('Instansi vertikal Pemerintah Pusat', 'Kanwil Kementerian ATR/BPN (BPN) Provinsi Jawa Barat', 12),
  ('Instansi vertikal Pemerintah Pusat', 'Kanwil Direktorat Jenderal Bea dan Cukai (DJBC) Jawa Barat – Kemenkeu', 13),
  ('Instansi vertikal Pemerintah Pusat', 'Kanwil Direktorat Jenderal Pajak (DJP) Jawa Barat I – Kemenkeu', 14),
  ('Instansi vertikal Pemerintah Pusat', 'Kanwil Direktorat Jenderal Perbendaharaan (DJPb) Provinsi Jawa Barat – Kemenkeu', 15),

  -- 2) Penegak hukum & keamanan (tingkat provinsi)
  ('Penegak hukum & keamanan', 'Kepolisian Daerah (Polda) Jawa Barat', 20),
  ('Penegak hukum & keamanan', 'Kejaksaan Tinggi (Kejati) Jawa Barat', 21),
  ('Penegak hukum & keamanan', 'Komando Daerah Militer III/Siliwangi (Kodam III/Siliwangi)', 22),

  -- 3) Lembaga peradilan (tingkat provinsi)
  ('Lembaga peradilan', 'Pengadilan Tinggi Bandung (wilayah Jawa Barat)', 30),

  -- 4) Lembaga negara/otoritas sektor (perwakilan di daerah)
  ('Lembaga negara/otoritas sektor', 'Kantor Perwakilan Bank Indonesia Provinsi Jawa Barat', 40),
  ('Lembaga negara/otoritas sektor', 'Kantor OJK Provinsi Jawa Barat', 41);
