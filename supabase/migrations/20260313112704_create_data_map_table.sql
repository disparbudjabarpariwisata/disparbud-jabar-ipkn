-- Create data_map table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.data_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_name VARCHAR(255) NOT NULL,
    city_type VARCHAR(50) NOT NULL,
    description TEXT,
    tourism_highlights TEXT,
    tourist_attractions TEXT,
    culinary TEXT,
    accommodation TEXT,
    transportation TEXT,
    image_url TEXT,
    website_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add JSONB column for health data if it doesn't exist.
-- To be safe, we also check if 'content' exists as our seed script tries to use it.
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.data_map ADD COLUMN medical_data JSONB;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE public.data_map ADD COLUMN content JSONB;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
END $$;
