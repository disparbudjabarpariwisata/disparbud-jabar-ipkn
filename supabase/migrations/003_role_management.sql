-- ============================================================
-- Migration 003: Role Management System
-- ============================================================

-- 1. role_types — Master data role (CRUD by admin)
CREATE TABLE IF NOT EXISTS role_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT 'Users',
  color TEXT DEFAULT 'blue',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. registered_users — Log user yang sudah register
CREATE TABLE IF NOT EXISTS registered_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT '',
  auth_provider TEXT NOT NULL DEFAULT 'email' CHECK (auth_provider IN ('email', 'google')),
  registered_date DATE NOT NULL DEFAULT CURRENT_DATE,
  registered_time TIME NOT NULL DEFAULT CURRENT_TIME,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE role_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE registered_users ENABLE ROW LEVEL SECURITY;

-- role_types: Public & authenticated can read active roles
CREATE POLICY "role_types_public_read" ON role_types
  FOR SELECT TO anon USING (active = true);

CREATE POLICY "role_types_authenticated_read" ON role_types
  FOR SELECT TO authenticated USING (true);

-- role_types: Admin only CUD
CREATE POLICY "role_types_admin_insert" ON role_types
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "role_types_admin_update" ON role_types
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "role_types_admin_delete" ON role_types
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

-- registered_users: Admin can read all
CREATE POLICY "registered_users_admin_read" ON registered_users
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

-- registered_users: Authenticated user can insert their own
CREATE POLICY "registered_users_insert" ON registered_users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- registered_users: User can read their own
CREATE POLICY "registered_users_own_read" ON registered_users
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- Seed: Insert existing 8 default roles
-- ============================================================

INSERT INTO role_types (name, description, icon, color, sort_order, active) VALUES
  ('Perangkat Daerah Provinsi Jawa Barat', 'OPD di lingkungan Pemerintah Provinsi Jawa Barat', 'Building2', 'blue', 0, true),
  ('Instansi Pemerintah Terkait', 'Kementerian, lembaga, atau instansi pemerintah terkait pariwisata', 'Landmark', 'purple', 1, true),
  ('Instansi Swasta Terkait', 'Perusahaan atau organisasi swasta di bidang pariwisata', 'Briefcase', 'emerald', 2, true),
  ('Komunitas/Asosiasi', 'Komunitas, asosiasi, atau organisasi masyarakat', 'Users', 'amber', 3, true),
  ('Pelaku Usaha Pariwisata', 'Hotel, restoran, agen perjalanan, dan usaha pariwisata lainnya', 'Store', 'rose', 4, true),
  ('Pemerintah Daerah Kota/Kabupaten Jawa Barat', 'Pemerintah daerah kota atau kabupaten di Jawa Barat', 'MapPin', 'teal', 5, true),
  ('Pemerintah Pusat', 'Kementerian atau lembaga di tingkat pusat/nasional', 'Crown', 'indigo', 6, true),
  ('Lembaga Internasional', 'Organisasi internasional, kedutaan, atau lembaga asing terkait pariwisata', 'Globe', 'cyan', 7, true);
