-- Hero Slides Table
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')) DEFAULT 'image',
  url TEXT NOT NULL,
  title TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SEO Settings Table (single row)
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_name TEXT NOT NULL DEFAULT 'Smiling West Java',
  meta_description TEXT DEFAULT '',
  keywords TEXT DEFAULT '',
  og_name TEXT DEFAULT '',
  og_image TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default SEO settings
INSERT INTO seo_settings (app_name, meta_description, keywords, og_name)
VALUES (
  'Smiling West Java',
  'Portal resmi pariwisata Jawa Barat. Jelajahi keindahan alam, budaya, dan kuliner khas Jawa Barat.',
  'pariwisata, jawa barat, tourism, west java, smiling west java',
  'Smiling West Java'
);

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hero_slides
-- All authenticated users can read
CREATE POLICY "hero_slides_read" ON hero_slides
  FOR SELECT TO authenticated USING (true);

-- Only admin can insert/update/delete (checked via email in JWT)
CREATE POLICY "hero_slides_admin_insert" ON hero_slides
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "hero_slides_admin_update" ON hero_slides
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

CREATE POLICY "hero_slides_admin_delete" ON hero_slides
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

-- RLS Policies for seo_settings
-- All authenticated users can read
CREATE POLICY "seo_settings_read" ON seo_settings
  FOR SELECT TO authenticated USING (true);

-- Only admin can update
CREATE POLICY "seo_settings_admin_update" ON seo_settings
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'disparbudjabarpariwisata2026@gmail.com');

-- Public can also read (for frontend SEO rendering)
CREATE POLICY "hero_slides_public_read" ON hero_slides
  FOR SELECT TO anon USING (active = true);

CREATE POLICY "seo_settings_public_read" ON seo_settings
  FOR SELECT TO anon USING (true);
