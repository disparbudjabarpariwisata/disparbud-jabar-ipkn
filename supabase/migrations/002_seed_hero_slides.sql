-- Add hero_mode column to seo_settings (toggle between 'slider' and 'video')
ALTER TABLE seo_settings ADD COLUMN IF NOT EXISTS hero_mode TEXT NOT NULL DEFAULT 'slider' CHECK (hero_mode IN ('slider', 'video'));
ALTER TABLE seo_settings ADD COLUMN IF NOT EXISTS hero_video_url TEXT DEFAULT '';

-- Update existing row
UPDATE seo_settings SET hero_mode = 'slider', hero_video_url = '';

-- Seed existing hero images into hero_slides table
INSERT INTO hero_slides (type, url, title, sort_order, active) VALUES
  ('image', 'https://res.cloudinary.com/dsxpxdsc5/image/upload/v1771638831/img-hero-1_t7jpua_ape8jo.png', 'Hero Image 1', 0, true),
  ('image', 'https://res.cloudinary.com/dsxpxdsc5/image/upload/v1771638831/img-hero-2_dk8hmk_prnjdb.png', 'Hero Image 2', 1, true),
  ('image', 'https://res.cloudinary.com/dsxpxdsc5/image/upload/v1771638831/img-hero-3_rz0d8f_yxdzpb.png', 'Hero Image 3', 2, true);
