-- 1. Pastikan tabel profiles memiliki kolom yang dibutuhkan
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text,
ADD COLUMN IF NOT EXISTS privacy_policy_agreed_at timestamptz DEFAULT now();

-- 2. Pastikan RLS (Row Level Security) aktif
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policy: User bisa melihat profilnya sendiri
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 4. Policy: User bisa mengupdate profilnya sendiri
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 5. FUNCTION & TRIGGER: Otomatis buat profil saat user Baru daftar
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, privacy_policy_agreed_at, username)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'role', 
    CASE 
      WHEN (new.raw_user_meta_data->>'privacyAccepted')::boolean = true THEN now()
      ELSE NULL
    END,
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Pasang Trigger ke tabel auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
