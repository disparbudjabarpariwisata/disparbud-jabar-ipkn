-- ============================================================
-- RLS: Amankan tabel kata_kreatif_jabar
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Aktifkan Row Level Security
ALTER TABLE public.kata_kreatif_jabar ENABLE ROW LEVEL SECURITY;

-- 2. Hapus semua policy lama jika ada
DROP POLICY IF EXISTS "Allow public read kata_kreatif_jabar" ON public.kata_kreatif_jabar;
DROP POLICY IF EXISTS "Allow anon read kata_kreatif_jabar" ON public.kata_kreatif_jabar;

-- 3. TIDAK membuat policy untuk anon/authenticated
--    → Hanya service_role (supabaseAdmin di server) yang dapat mengakses
--    → Semua request publik via anon key akan ditolak otomatis

-- Opsional: Verifikasi RLS aktif
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public' AND tablename = 'kata_kreatif_jabar';
