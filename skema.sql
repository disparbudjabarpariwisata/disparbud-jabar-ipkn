-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.cities_jabar (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cities_jabar_pkey PRIMARY KEY (id)
);
CREATE TABLE public.hero_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'image'::text CHECK (type = ANY (ARRAY['image'::text, 'video'::text])),
  url text NOT NULL,
  title text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hero_slides_pkey PRIMARY KEY (id)
);
CREATE TABLE public.institution_names (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT institution_names_pkey PRIMARY KEY (id)
);
CREATE TABLE public.institution_names2 (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT institution_names2_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  updated_at timestamp with time zone,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  role text CHECK (role = ANY (ARRAY['Nasional'::text, 'Provinsi'::text, 'Kota/Kabupaten'::text, 'Mitra Pariwisata'::text, 'Akademisi'::text])),
  institution_name text,
  email text,
  privacy_policy_agreed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.registered_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  role text DEFAULT ''::text,
  auth_provider text NOT NULL DEFAULT 'email'::text CHECK (auth_provider = ANY (ARRAY['email'::text, 'google'::text])),
  registered_date date NOT NULL DEFAULT CURRENT_DATE,
  registered_time time without time zone NOT NULL DEFAULT CURRENT_TIME,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT registered_users_pkey PRIMARY KEY (id),
  CONSTRAINT registered_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.role_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text DEFAULT ''::text,
  icon text DEFAULT 'Users'::text,
  color text DEFAULT 'blue'::text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT role_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.seo_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  app_name text NOT NULL DEFAULT 'Smiling West Java'::text,
  meta_description text DEFAULT ''::text,
  keywords text DEFAULT ''::text,
  og_name text DEFAULT ''::text,
  og_image text DEFAULT ''::text,
  logo_url text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  hero_mode text NOT NULL DEFAULT 'slider'::text CHECK (hero_mode = ANY (ARRAY['slider'::text, 'video'::text])),
  hero_video_url text DEFAULT ''::text,
  CONSTRAINT seo_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.survey_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  respondent_id uuid NOT NULL,
  role_id uuid NOT NULL,
  question_id uuid NOT NULL,
  answer_text text,
  answer_json jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT survey_answers_pkey PRIMARY KEY (id),
  CONSTRAINT survey_answers_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role_types(id),
  CONSTRAINT survey_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.survey_questions(id)
);
CREATE TABLE public.survey_international_tourism (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_name text NOT NULL DEFAULT 'Internasional Tourism Institution'::text,
  institution text NOT NULL,
  pic_name text NOT NULL,
  position text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  pin text NOT NULL,
  status text DEFAULT 'incomplete'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ip_address text,
  location text,
  CONSTRAINT survey_international_tourism_pkey PRIMARY KEY (id)
);
CREATE TABLE public.survey_komunitas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_name text NOT NULL DEFAULT 'Komunitas / Asosiasi'::text,
  institution text NOT NULL,
  pic_name text NOT NULL,
  position text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  pin text NOT NULL,
  status text DEFAULT 'incomplete'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ip_address text,
  location text,
  CONSTRAINT survey_komunitas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.survey_pelaku_usaha (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_name text NOT NULL DEFAULT 'Pelaku Usaha Pariwisata / Ekraf'::text,
  institution text NOT NULL,
  pic_name text NOT NULL,
  position text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  pin text NOT NULL,
  status text DEFAULT 'incomplete'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ip_address text,
  location text,
  CONSTRAINT survey_pelaku_usaha_pkey PRIMARY KEY (id)
);
CREATE TABLE public.survey_pemda_kabkota (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_name text NOT NULL DEFAULT 'Pemerintah Daerah Kota/Kabupaten Jawa Barat'::text,
  city text NOT NULL,
  institution text NOT NULL,
  pic_name text NOT NULL,
  position text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  pin text NOT NULL,
  status text DEFAULT 'incomplete'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ip_address text,
  location text,
  CONSTRAINT survey_pemda_kabkota_pkey PRIMARY KEY (id)
);
CREATE TABLE public.survey_pemerintah_pusat (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_name text NOT NULL DEFAULT 'Pemerintah Pusat'::text,
  institution text NOT NULL,
  pic_name text NOT NULL,
  position text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  pin text NOT NULL,
  status text DEFAULT 'incomplete'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ip_address text,
  location text,
  CONSTRAINT survey_pemerintah_pusat_pkey PRIMARY KEY (id)
);
CREATE TABLE public.survey_pemerintah_terkait (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_name text NOT NULL DEFAULT 'Instansi Pemerintah Terkait'::text,
  institution text NOT NULL,
  pic_name text NOT NULL,
  position text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  pin text NOT NULL,
  status text DEFAULT 'incomplete'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ip_address text,
  location text,
  CONSTRAINT survey_pemerintah_terkait_pkey PRIMARY KEY (id)
);
CREATE TABLE public.survey_perangkat_daerah (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_name text NOT NULL DEFAULT 'Perangkat Daerah Provinsi Jawa Barat'::text,
  institution text NOT NULL,
  pic_name text NOT NULL,
  position text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  pin text NOT NULL,
  status text DEFAULT 'incomplete'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ip_address text,
  location text,
  CONSTRAINT survey_perangkat_daerah_pkey PRIMARY KEY (id)
);
CREATE TABLE public.survey_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL,
  options jsonb,
  is_required boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  depends_on_question_id uuid,
  depends_on_answer text,
  institution_name text,
  CONSTRAINT survey_questions_pkey PRIMARY KEY (id),
  CONSTRAINT survey_questions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role_types(id),
  CONSTRAINT survey_questions_depends_on_question_id_fkey FOREIGN KEY (depends_on_question_id) REFERENCES public.survey_questions(id)
);
CREATE TABLE public.survey_swasta_terkait (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_name text NOT NULL DEFAULT 'Instansi / Lembaga Swasta Terkait'::text,
  institution text NOT NULL,
  pic_name text NOT NULL,
  position text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  pin text NOT NULL,
  status text DEFAULT 'incomplete'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ip_address text,
  location text,
  CONSTRAINT survey_swasta_terkait_pkey PRIMARY KEY (id)
);