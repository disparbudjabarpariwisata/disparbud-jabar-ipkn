-- ============================================================
-- Migration 010: Respondent Tracking Columns (IP & Location)
-- ============================================================

-- 1. survey_perangkat_daerah
ALTER TABLE survey_perangkat_daerah 
    ADD COLUMN IF NOT EXISTS ip_address TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT;

-- 2. survey_pemerintah_terkait (Instansi Pemerintah Terkait)
ALTER TABLE survey_pemerintah_terkait 
    ADD COLUMN IF NOT EXISTS ip_address TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT;

-- 3. survey_swasta_terkait (Instansi / Lembaga Swasta Terkait)
ALTER TABLE survey_swasta_terkait 
    ADD COLUMN IF NOT EXISTS ip_address TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT;

-- 4. survey_komunitas (Komunitas / Asosiasi)
ALTER TABLE survey_komunitas 
    ADD COLUMN IF NOT EXISTS ip_address TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT;

-- 5. survey_pelaku_usaha (Pelaku Usaha Pariwisata / Ekraf)
ALTER TABLE survey_pelaku_usaha 
    ADD COLUMN IF NOT EXISTS ip_address TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT;

-- 6. survey_pemda_kabkota (Pemerintah Daerah Kota/Kabupaten Jawa Barat)
ALTER TABLE survey_pemda_kabkota 
    ADD COLUMN IF NOT EXISTS ip_address TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT;

-- 7. survey_pemerintah_pusat (Pemerintah Pusat)
ALTER TABLE survey_pemerintah_pusat 
    ADD COLUMN IF NOT EXISTS ip_address TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT;

-- 8. survey_international_tourism (Internasional Tourism Institution)
ALTER TABLE survey_international_tourism 
    ADD COLUMN IF NOT EXISTS ip_address TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT;
