-- ==============================================================================
-- SKILLUP - MIGRATION 02 : RÔLES ÉLÈVE, FORMATEUR ET ADMINISTRATEUR
-- ==============================================================================

-- 1. Ajout de la colonne role avec contrainte CHECK sur la table profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student'
  CHECK (role IN ('student', 'instructor', 'admin'));

-- 2. Index pour accélérer les requêtes filtrées par rôle
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- 3. Mise à jour de la fonction trigger : respect du rôle choisi à l'inscription ('instructor' ou 'student', jamais 'admin' auto-attribué)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  initial_role TEXT;
BEGIN
  IF (NEW.raw_user_meta_data->>'role') = 'instructor' THEN
    initial_role := 'instructor';
  ELSE
    initial_role := 'student';
  END IF;

  INSERT INTO public.profiles (
    id,
    user_id,
    email,
    first_name,
    last_name,
    avatar_url,
    role
  )
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    initial_role
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
