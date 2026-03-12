-- Migration 018: Remove unused roles and tables

-- Drop the isolated survey tables for the removed roles
DROP TABLE IF EXISTS public.survey_swasta_terkait CASCADE;
DROP TABLE IF EXISTS public.survey_komunitas CASCADE;
DROP TABLE IF EXISTS public.survey_pelaku_usaha CASCADE;
DROP TABLE IF EXISTS public.survey_pemerintah_pusat CASCADE;
DROP TABLE IF EXISTS public.survey_international_tourism CASCADE;

-- Remove from role_types
DELETE FROM public.role_types 
WHERE name IN (
  'Instansi Swasta Terkait', 
  'Instansi / Lembaga Swasta Terkait',
  'Komunitas/Asosiasi', 
  'Komunitas / Asosiasi',
  'Pelaku Usaha Pariwisata', 
  'Pelaku Usaha Pariwisata / Ekraf',
  'Pemerintah Pusat', 
  'Lembaga Internasional',
  'Internasional Tourism Institution',
  'International Tourism Institution'
);

-- Recreate get_survey_session_by_pin without the deleted tables
CREATE OR REPLACE FUNCTION public.get_survey_session_by_pin(
  p_email text,
  p_pin text,
  p_role_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  IF p_role_type = 'Perangkat Daerah Provinsi Jawa Barat' THEN
    SELECT row_to_json(r) INTO v_result FROM public.survey_perangkat_daerah r WHERE email = p_email AND pin = p_pin LIMIT 1;
  
  ELSIF p_role_type = 'Instansi Pemerintah Terkait' THEN
    SELECT row_to_json(r) INTO v_result FROM public.survey_pemerintah_terkait r WHERE email = p_email AND pin = p_pin LIMIT 1;
    
  ELSIF p_role_type = 'Pemerintah Daerah Kota/Kabupaten Jawa Barat' THEN
    SELECT row_to_json(r) INTO v_result FROM public.survey_pemda_kabkota r WHERE email = p_email AND pin = p_pin LIMIT 1;
    
  ELSE
    v_result := NULL;
  END IF;

  RETURN v_result;
END;
$$;
