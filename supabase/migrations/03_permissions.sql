-- ==============================================================================
-- SKILLUP - MIGRATION 03 : SYSTÈME DE PERMISSIONS ET CONTRÔLE D'ACCÈS RLS
-- ==============================================================================

-- 1. Fonction sécurisée pour récupérer le rôle d'un utilisateur (SECURITY DEFINER)
-- Permet aux futures politiques RLS d'inspecter le rôle sans contournement possible
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Prédicats rapides pour vérifier les rôles
-- A. Vérifier si un utilisateur est formateur
CREATE OR REPLACE FUNCTION public.is_instructor(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid AND role = 'instructor'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- B. Vérifier si un utilisateur est administrateur
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Sécurité anti-falsification : Interdire la modification directe du rôle par l'utilisateur
-- Empêche formellement un élève de s'octroyer le rôle 'instructor' ou 'admin' via le client
-- Seules les opérations serveur autorisées (service_role) peuvent modifier un rôle
CREATE OR REPLACE FUNCTION public.prevent_role_tampering()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Seul le serveur d'administration (service_role) est habilité à promouvoir un utilisateur
    IF COALESCE(auth.jwt()->>'role', '') <> 'service_role' THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_role_tampering ON public.profiles;
CREATE TRIGGER tr_prevent_role_tampering
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_tampering();

-- 4. Politique d'administration pour la gestion serveur des profils
CREATE POLICY "Service role manages profiles"
  ON public.profiles
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ==============================================================================
-- 5. VUE SÉCURISÉE : PROFILS PUBLICS DES FORMATEURS (CATALOGUE & COURS)
-- Expose STRICTEMENT l'identité publique nécessaire (prénom, nom, avatar)
-- Ne divulgue JAMAIS l'email, le téléphone ou les informations privées des formateurs
-- ==============================================================================
CREATE OR REPLACE VIEW public.instructor_public_profiles AS
SELECT 
  id,
  first_name,
  last_name,
  avatar_url
FROM public.profiles
WHERE role = 'instructor';

-- Permissions de lecture pour tous (visiteurs anonymes et élèves connectés)
GRANT SELECT ON public.instructor_public_profiles TO anon, authenticated;

-- ==============================================================================
-- 6. SPÉCIFICATION ET FONDATIONS DES POLITIQUES RLS POUR LES TABLES FUTURES
-- (Ces règles documentent le modèle de sécurité applicable dès la création des tables)
--
-- Table courses :
--   - SELECT : (is_published = true) OR (instructor_id = auth.uid())
--   - INSERT : public.is_instructor(auth.uid()) AND (instructor_id = auth.uid())
--   - UPDATE : (instructor_id = auth.uid())
--   - DELETE : (instructor_id = auth.uid())
--
-- Table course_access / course_purchases :
--   - SELECT : (student_id = auth.uid()) OR (EXISTS course WHERE instructor_id = auth.uid())
--   - INSERT : Contrôlé côté serveur via webhook de paiement vérifié
--
-- Principe :
--   - Élève : ZÉRO droit d'écriture sur les cours et modules.
--   - Formateur : AUCUN droit de modification sur les cours d'un autre formateur.
-- ==============================================================================
