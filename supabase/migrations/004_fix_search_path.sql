-- Fix Supabase Advisor Warning: function_search_path_mutable
-- Set search_path to empty string for handle_new_user function

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
