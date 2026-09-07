-- ==============================================================================
-- SKILLUP - MIGRATION 07 : GESTION DU CONTENU FORMATEUR (PHASE 9E)
-- ==============================================================================
-- Tables : courses, course_modules, course_lessons
-- Modèle relationnel : Formation -> Modules -> Leçons
-- Sécurité : RLS stricte, intégrité composite course_id/module_id,
--            protection stricte du contenu des leçons (course_access obligatoire),
--            protection anti-suppression des formations déjà achetées.
-- ==============================================================================

-- ============================================================
-- 0. FONCTION UTILITAIRE : set_updated_at()
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 1. TABLE : courses
-- Table centrale des formations créées par les formateurs.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Développement',
  level TEXT NOT NULL DEFAULT 'Débutant' CHECK (level IN ('Débutant', 'Intermédiaire', 'Avancé')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  pricing_type TEXT NOT NULL DEFAULT 'free' CHECK (pricing_type IN ('free', 'paid')),
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  thumbnail_url TEXT,
  duration TEXT DEFAULT '0 min',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT chk_course_pricing_consistency CHECK (
    (pricing_type = 'free' AND price = 0) OR
    (pricing_type = 'paid' AND price >= 0)
  )
);

-- Index pour performances et filtrage
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_pricing_type ON public.courses(pricing_type);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON public.courses(created_at DESC);

-- Trigger mise à jour automatique updated_at
DROP TRIGGER IF EXISTS tr_courses_updated_at ON public.courses;
CREATE TRIGGER tr_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 2. TABLE : course_modules
-- Modules thématiques d'une formation.
-- Contrainte UNIQUE composite (id, course_id) pour l'intégrité relationnelle avec les leçons.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 1 CHECK (sort_order >= 1),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT uq_course_modules_id_course UNIQUE (id, course_id)
);

-- Index pour tri et liaisons
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON public.course_modules(course_id, sort_order ASC);

-- Trigger mise à jour automatique updated_at
DROP TRIGGER IF EXISTS tr_course_modules_updated_at ON public.course_modules;
CREATE TRIGGER tr_course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 3. TABLE : course_lessons
-- Leçons individuelles au sein d'un module.
-- Supporte vidéo (URL externe/streaming) ou texte.
-- INTÉGRITÉ COMPOSITE STRICTE : la clé étrangère (module_id, course_id)
-- garantit que le module_id appartient obligatoirement au même course_id.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL,
  course_id UUID NOT NULL,
  title TEXT NOT NULL,
  duration TEXT NOT NULL DEFAULT '10 min',
  content_type TEXT NOT NULL DEFAULT 'video' CHECK (content_type IN ('video', 'text')),
  video_url TEXT,
  text_content TEXT,
  sort_order INTEGER NOT NULL DEFAULT 1 CHECK (sort_order >= 1),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT fk_course_lessons_course FOREIGN KEY (course_id)
    REFERENCES public.courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_course_lessons_module_course FOREIGN KEY (module_id, course_id)
    REFERENCES public.course_modules(id, course_id) ON DELETE CASCADE
);

-- Index pour tri et liaisons
CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON public.course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course ON public.course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON public.course_lessons(module_id, sort_order ASC);

-- Trigger mise à jour automatique updated_at
DROP TRIGGER IF EXISTS tr_course_lessons_updated_at ON public.course_lessons;
CREATE TRIGGER tr_course_lessons_updated_at
  BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TRIGGER D'INTÉGRITÉ EXPLICITE : vérification course_id / module_id
CREATE OR REPLACE FUNCTION public.check_lesson_course_module_integrity()
RETURNS TRIGGER AS $$
DECLARE
  v_module_course_id UUID;
BEGIN
  SELECT course_id INTO v_module_course_id
  FROM public.course_modules
  WHERE id = NEW.module_id;

  IF v_module_course_id IS NULL THEN
    RAISE EXCEPTION 'Le module spécifié (%) n''existe pas.', NEW.module_id;
  END IF;

  IF v_module_course_id <> NEW.course_id THEN
    RAISE EXCEPTION 'Incohérence d''intégrité : le module (%) appartient à la formation (%) et ne peut pas être associé à la formation (%).',
      NEW.module_id, v_module_course_id, NEW.course_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_lesson_course_module_integrity ON public.course_lessons;
CREATE TRIGGER tr_check_lesson_course_module_integrity
  BEFORE INSERT OR UPDATE OF course_id, module_id ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.check_lesson_course_module_integrity();


-- ============================================================
-- 4. RÈGLE DE PROTECTION ANTI-SUPPRESSION DE CONTENU ACHETÉ
-- Règle 5 : Une formation ayant des achats ou des accès accordés
-- ne peut pas être supprimée physiquement (DELETE). Elle doit être archivée.
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_purchased_course_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si la formation a déjà des achats réussis ou des accès accordés
  IF EXISTS (
    SELECT 1 FROM public.course_purchases 
    WHERE course_id = OLD.id::text AND status = 'successful'
  ) OR EXISTS (
    SELECT 1 FROM public.course_access 
    WHERE course_id = OLD.id::text
  ) THEN
    RAISE EXCEPTION 'Impossible de supprimer définitivement une formation possédant déjà des acheteurs ou élèves inscrits. Veuillez changer son statut en ''archived''.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_purchased_course_deletion ON public.courses;
CREATE TRIGGER tr_prevent_purchased_course_deletion
  BEFORE DELETE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.prevent_purchased_course_deletion();


-- ============================================================
-- 5. RÈGLE DE PUBLICATION CONTRÔLÉE
-- Règle 6 : Conditions pour publier (status = 'published') :
-- - Titre, description, catégorie valides
-- - Au moins 1 module et au moins 1 leçon
-- - Prix > 0 si payant
-- - Abonnement formateur actif (contrôlé si hors service_role)
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_course_publication_requirements()
RETURNS TRIGGER AS $$
DECLARE
  v_module_count INTEGER;
  v_lesson_count INTEGER;
  v_has_active_sub BOOLEAN;
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status <> 'published') THEN
    -- Titre non vide
    IF TRIM(COALESCE(NEW.title, '')) = '' THEN
      RAISE EXCEPTION 'Un cours doit posséder un titre valide pour être publié.';
    END IF;

    -- Description non vide
    IF TRIM(COALESCE(NEW.description, '')) = '' THEN
      RAISE EXCEPTION 'Un cours doit posséder une description valide pour être publié.';
    END IF;

    -- Catégorie non vide
    IF TRIM(COALESCE(NEW.category, '')) = '' THEN
      RAISE EXCEPTION 'Un cours doit posséder une catégorie pour être publié.';
    END IF;

    -- Prix valide si payant
    IF NEW.pricing_type = 'paid' AND NEW.price <= 0 THEN
      RAISE EXCEPTION 'Une formation payante doit avoir un prix strictement supérieur à 0 XOF.';
    END IF;

    -- Vérification abonnement actif du formateur (si exécuté directement par le client)
    IF COALESCE(auth.jwt()->>'role', '') <> 'service_role' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.instructor_subscriptions
        WHERE instructor_id = NEW.instructor_id AND status = 'active'
      ) INTO v_has_active_sub;

      IF NOT v_has_active_sub THEN
        RAISE EXCEPTION 'Le formateur doit posséder un abonnement actif pour publier une formation.';
      END IF;
    END IF;

    -- Vérification de la présence d''au moins un module
    SELECT COUNT(*) INTO v_module_count FROM public.course_modules WHERE course_id = NEW.id;
    IF v_module_count = 0 THEN
      RAISE EXCEPTION 'Une formation doit contenir au moins un module pour pouvoir être publiée.';
    END IF;

    -- Vérification de la présence d''au moins une leçon
    SELECT COUNT(*) INTO v_lesson_count FROM public.course_lessons WHERE course_id = NEW.id;
    IF v_lesson_count = 0 THEN
      RAISE EXCEPTION 'Une formation doit contenir au moins une leçon pour pouvoir être publiée.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_course_publication ON public.courses;
CREATE TRIGGER tr_check_course_publication
  BEFORE INSERT OR UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.check_course_publication_requirements();


-- ============================================================
-- 6. POLITIQUES DE SÉCURITÉ RLS (ROW LEVEL SECURITY)
-- ============================================================

-- ------------------------------------------------------------
-- A. Table public.courses
-- ------------------------------------------------------------
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Lecture : accessible à tous si publiée OU au formateur propriétaire
CREATE POLICY "Public can view published courses and instructors own courses"
  ON public.courses
  FOR SELECT
  USING (
    status = 'published'
    OR (auth.uid() IS NOT NULL AND instructor_id = auth.uid())
  );

-- Insertion : réservée aux formateurs pour leurs propres formations
CREATE POLICY "Instructors can insert own courses"
  ON public.courses
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND instructor_id = auth.uid()
    AND public.is_instructor(auth.uid())
  );

-- Mise à jour : uniquement le formateur propriétaire
CREATE POLICY "Instructors can update own courses"
  ON public.courses
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND instructor_id = auth.uid()
    AND public.is_instructor(auth.uid())
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND instructor_id = auth.uid()
    AND public.is_instructor(auth.uid())
  );

-- Suppression : uniquement le formateur propriétaire (bloqué par trigger si achats existants)
CREATE POLICY "Instructors can delete own courses"
  ON public.courses
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND instructor_id = auth.uid()
    AND public.is_instructor(auth.uid())
  );

-- Accès complet pour service_role
CREATE POLICY "Service role manages courses"
  ON public.courses
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');


-- ------------------------------------------------------------
-- B. Table public.course_modules
-- ------------------------------------------------------------
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- Lecture : structure visible si cours publié OU par le formateur propriétaire du cours
CREATE POLICY "Public can view modules of published courses and instructor own modules"
  ON public.course_modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_modules.course_id
        AND (c.status = 'published' OR (auth.uid() IS NOT NULL AND c.instructor_id = auth.uid()))
    )
  );

-- Insertion : uniquement le formateur propriétaire du cours parent
CREATE POLICY "Instructors can insert modules for own courses"
  ON public.course_modules
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_modules.course_id
        AND c.instructor_id = auth.uid()
        AND public.is_instructor(auth.uid())
    )
  );

-- Mise à jour : uniquement le formateur propriétaire du cours parent
CREATE POLICY "Instructors can update modules for own courses"
  ON public.course_modules
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_modules.course_id
        AND c.instructor_id = auth.uid()
        AND public.is_instructor(auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_modules.course_id
        AND c.instructor_id = auth.uid()
        AND public.is_instructor(auth.uid())
    )
  );

-- Suppression : uniquement le formateur propriétaire du cours parent
CREATE POLICY "Instructors can delete modules for own courses"
  ON public.course_modules
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_modules.course_id
        AND c.instructor_id = auth.uid()
        AND public.is_instructor(auth.uid())
    )
  );

-- Accès complet pour service_role
CREATE POLICY "Service role manages course modules"
  ON public.course_modules
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');


-- ------------------------------------------------------------
-- C. Table public.course_lessons
-- SÉCURITÉ RENFORCÉE (CORRECTION PROBLÈME 1) :
-- Le contenu des leçons (video_url, text_content) n'est JAMAIS accessible
-- aux visiteurs ni aux étudiants sans accès valide.
-- Seuls y ont accès :
-- 1. Le formateur propriétaire de la formation
-- 2. L'étudiant ayant un accès formellement accordé dans public.course_access
-- 3. Le service_role backend
-- ------------------------------------------------------------
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Lecture STRICTE du contenu des leçons
CREATE POLICY "Authorized users can view course lessons"
  ON public.course_lessons
  FOR SELECT
  USING (
    (auth.jwt()->>'role' = 'service_role')
    OR (
      auth.uid() IS NOT NULL AND (
        -- 1. Le formateur propriétaire de la formation
        EXISTS (
          SELECT 1 FROM public.courses c
          WHERE c.id = course_lessons.course_id
            AND c.instructor_id = auth.uid()
        )
        OR
        -- 2. L'élève possédant un accès accordé et vérifié (payant ou gratuit via course_access)
        EXISTS (
          SELECT 1 FROM public.course_access ca
          WHERE ca.course_id = course_lessons.course_id::text
            AND ca.student_id = auth.uid()
        )
      )
    )
  );

-- Insertion : uniquement le formateur propriétaire du cours parent
CREATE POLICY "Instructors can insert lessons for own courses"
  ON public.course_lessons
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_lessons.course_id
        AND c.instructor_id = auth.uid()
        AND public.is_instructor(auth.uid())
    )
  );

-- Mise à jour : uniquement le formateur propriétaire du cours parent
CREATE POLICY "Instructors can update lessons for own courses"
  ON public.course_lessons
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_lessons.course_id
        AND c.instructor_id = auth.uid()
        AND public.is_instructor(auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_lessons.course_id
        AND c.instructor_id = auth.uid()
        AND public.is_instructor(auth.uid())
    )
  );

-- Suppression : uniquement le formateur propriétaire du cours parent
CREATE POLICY "Instructors can delete lessons for own courses"
  ON public.course_lessons
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_lessons.course_id
        AND c.instructor_id = auth.uid()
        AND public.is_instructor(auth.uid())
    )
  );

-- Accès complet pour service_role
CREATE POLICY "Service role manages course lessons"
  ON public.course_lessons
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ==============================================================================
-- FIN DE LA MIGRATION 07
-- ==============================================================================
