-- ================================================================
-- MIGRATION: Buat 3 Tabel Data Pariwisata Jawa Barat
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- TABEL 1: Data Kesehatan per Kota/Kab per Tahun
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.data_kesehatan_jabar (
  id               uuid         NOT NULL DEFAULT gen_random_uuid(),
  city_name        text         NOT NULL,
  city_type        text         NOT NULL DEFAULT '',
  tahun            integer      NOT NULL,
  penduduk         bigint       DEFAULT 0,
  peserta_jkn      bigint       DEFAULT 0,
  rasio_jkn        float8       DEFAULT 0,
  total_dokter     integer      DEFAULT 0,
  rasio_dokter_per_1000   float8  DEFAULT 0,
  tempat_tidur_rs  integer      DEFAULT 0,
  rasio_rst_per_1000      float8  DEFAULT 0,
  kasus_dbd        integer      DEFAULT 0,
  kasus_hiv_baru   integer      DEFAULT 0,
  kasus_kusta_baru integer      DEFAULT 0,
  kasus_tbc        integer      DEFAULT 0,
  kasus_malaria    integer      DEFAULT 0,
  kasus_filariasis integer      DEFAULT 0,
  created_at       timestamptz  DEFAULT now(),
  updated_at       timestamptz  DEFAULT now(),
  CONSTRAINT data_kesehatan_jabar_pkey PRIMARY KEY (id),
  CONSTRAINT data_kesehatan_jabar_city_tahun_unique UNIQUE (city_name, tahun)
);

ALTER TABLE public.data_kesehatan_jabar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read data_kesehatan_jabar" ON public.data_kesehatan_jabar;

COMMENT ON TABLE public.data_kesehatan_jabar IS
  'Data indikator kesehatan per kota/kabupaten Jawa Barat per tahun (JKN, Dokter, RST, Penyakit Menular).';

-- ────────────────────────────────────────────────────────────────
-- TABEL 2: Data Desa Wisata per Kota/Kab
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.data_desa_wisata_jabar (
  id                uuid        NOT NULL DEFAULT gen_random_uuid(),
  city_name         text        NOT NULL,
  city_type         text        NOT NULL DEFAULT '',
  nama_desa_wisata  text        NOT NULL,
  status            text        DEFAULT 'Rintisan',
  kecamatan         text        DEFAULT '',
  desa_kelurahan    text        DEFAULT '',
  potensi_alam      text        DEFAULT '',
  potensi_buatan    text        DEFAULT '',
  potensi_budaya    text        DEFAULT '',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  CONSTRAINT data_desa_wisata_jabar_pkey PRIMARY KEY (id)
);

ALTER TABLE public.data_desa_wisata_jabar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read data_desa_wisata_jabar" ON public.data_desa_wisata_jabar;

COMMENT ON TABLE public.data_desa_wisata_jabar IS
  'Daftar Desa Wisata di seluruh 27 kota/kabupaten Jawa Barat beserta status dan potensi wisata.';

-- ────────────────────────────────────────────────────────────────
-- TABEL 3: Data Sarana & Prasarana Olahraga per Kota/Kab
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.data_sarpras_olahraga_jabar (
  id                  uuid        NOT NULL DEFAULT gen_random_uuid(),
  city_name           text        NOT NULL,
  city_type           text        NOT NULL DEFAULT '',
  cabang_olahraga     text        NOT NULL,
  kode_cabang         text        DEFAULT '',
  kategori_fasilitas  text        DEFAULT '',
  subkategori         text        DEFAULT '',
  kelas_kualitas      text        DEFAULT '',
  jumlah_unit         integer     DEFAULT 0,
  nama_fasilitas      text        DEFAULT '',
  catatan             text        DEFAULT '',
  row_id              text        DEFAULT '',
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  CONSTRAINT data_sarpras_olahraga_jabar_pkey PRIMARY KEY (id)
);

ALTER TABLE public.data_sarpras_olahraga_jabar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read data_sarpras_olahraga_jabar" ON public.data_sarpras_olahraga_jabar;

COMMENT ON TABLE public.data_sarpras_olahraga_jabar IS
  'Data sarana dan prasarana olahraga per cabang olahraga di 27 kota/kabupaten Jawa Barat.';

-- ────────────────────────────────────────────────────────────────
-- Verifikasi: cek tabel sudah dibuat dan RLS aktif
-- ────────────────────────────────────────────────────────────────
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'data_kesehatan_jabar',
    'data_desa_wisata_jabar',
    'data_sarpras_olahraga_jabar'
  );
