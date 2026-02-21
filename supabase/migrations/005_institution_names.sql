-- ============================================================
-- Migration 005: Institution Names
-- ============================================================

CREATE TABLE IF NOT EXISTS institution_names (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE institution_names ENABLE ROW LEVEL SECURITY;

-- Public & authenticated can read active institutions
CREATE POLICY "institution_names_public_read" ON institution_names
  FOR SELECT TO anon USING (active = true);

CREATE POLICY "institution_names_authenticated_read" ON institution_names
  FOR SELECT TO authenticated USING (true);

-- Admin only CUD
CREATE POLICY "institution_names_admin_insert" ON institution_names
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "institution_names_admin_update" ON institution_names
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "institution_names_admin_delete" ON institution_names
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

-- ============================================================
-- Seed Data
-- ============================================================

INSERT INTO institution_names (category, name, sort_order) VALUES
  -- A. Unsur Pengawasan & Kesekretariatan
  ('Unsur Pengawasan & Kesekretariatan', 'Inspektorat Provinsi Jawa Barat', 1),
  ('Unsur Pengawasan & Kesekretariatan', 'Sekretariat DPRD Provinsi Jawa Barat', 2),

  -- B. Badan Daerah
  ('Badan Daerah', 'Badan Kepegawaian Daerah (BKD)', 10),
  ('Badan Daerah', 'Badan Kesatuan Bangsa dan Politik (Bakesbangpol)', 11),
  ('Badan Daerah', 'Badan Penanggulangan Bencana Daerah (BPBD)', 12),
  ('Badan Daerah', 'Badan Pendapatan Daerah (Bapenda)', 13),
  ('Badan Daerah', 'Badan Penelitian dan Pengembangan Daerah (BP2D)', 14),
  ('Badan Daerah', 'Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD)', 15),
  ('Badan Daerah', 'Badan Pengembangan Sumber Daya Manusia (BPSDM)', 16),
  ('Badan Daerah', 'Badan Penghubung Provinsi Jawa Barat', 17),
  ('Badan Daerah', 'Badan Perencanaan Pembangunan Daerah (Bappeda)', 18),

  -- C. Dinas Daerah
  ('Dinas Daerah', 'Dinas Bina Marga dan Penataan Ruang', 20),
  ('Dinas Daerah', 'Dinas Energi dan Sumber Daya Mineral', 21),
  ('Dinas Daerah', 'Dinas Kehutanan', 22),
  ('Dinas Daerah', 'Dinas Kelautan dan Perikanan', 23),
  ('Dinas Daerah', 'Dinas Kependudukan dan Pencatatan Sipil', 24),
  ('Dinas Daerah', 'Dinas Kesehatan', 25),
  ('Dinas Daerah', 'Dinas Ketahanan Pangan dan Peternakan', 26),
  ('Dinas Daerah', 'Dinas Komunikasi dan Informatika', 27),
  ('Dinas Daerah', 'Dinas Koperasi dan Usaha Kecil', 28),
  ('Dinas Daerah', 'Dinas Lingkungan Hidup', 29),
  ('Dinas Daerah', 'Dinas Pariwisata dan Kebudayaan', 30),
  ('Dinas Daerah', 'Dinas Pemberdayaan Masyarakat dan Desa', 31),
  ('Dinas Daerah', 'Dinas Pemberdayaan Perempuan, Perlindungan Anak dan Keluarga Berencana', 32),
  ('Dinas Daerah', 'Dinas Pemuda dan Olahraga', 33),
  ('Dinas Daerah', 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP)', 34),
  ('Dinas Daerah', 'Dinas Pendidikan', 35),
  ('Dinas Daerah', 'Dinas Perhubungan', 36),
  ('Dinas Daerah', 'Dinas Perindustrian dan Perdagangan', 37),
  ('Dinas Daerah', 'Dinas Perkebunan', 38),
  ('Dinas Daerah', 'Dinas Perpustakaan dan Kearsipan Daerah', 39),
  ('Dinas Daerah', 'Dinas Perumahan dan Permukiman', 40),
  ('Dinas Daerah', 'Dinas Sosial', 41),
  ('Dinas Daerah', 'Dinas Sumber Daya Air', 42),
  ('Dinas Daerah', 'Dinas Tanaman Pangan dan Holtikultura', 43),
  ('Dinas Daerah', 'Dinas Tenaga Kerja dan Transmigrasi', 44),

  -- D. Biro di lingkungan Setda
  ('Biro Sekretariat Daerah', 'Biro BUMD, Investasi dan Administrasi Pembangunan', 50),
  ('Biro Sekretariat Daerah', 'Biro Hukum dan Hak Asasi Manusia', 51),
  ('Biro Sekretariat Daerah', 'Biro Umum', 52),
  ('Biro Sekretariat Daerah', 'Biro Kesejahteraan Rakyat', 53),
  ('Biro Sekretariat Daerah', 'Biro Organisasi', 54),
  ('Biro Sekretariat Daerah', 'Biro Pemerintahan dan Otonomi Daerah', 55),
  ('Biro Sekretariat Daerah', 'Biro Perekonomian', 56),

  -- E. Satuan Polisi Pamong Praja
  ('Satuan Polisi Pamong Praja', 'Satuan Polisi Pamong Praja (Satpol PP) Provinsi Jawa Barat', 60);
