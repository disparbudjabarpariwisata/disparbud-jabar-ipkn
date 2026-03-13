-- Migration to add desa_wisata_data column to data_map table
ALTER TABLE public.data_map 
ADD COLUMN IF NOT EXISTS desa_wisata_data JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN public.data_map.desa_wisata_data IS 'Aggregated data of tourism villages (Desa Wisata) for each city/kabupaten.';
