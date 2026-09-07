-- ==============================================================================
-- SKILLUP - MIGRATION 04 : ABONNEMENTS DES FORMATEURS (PHASE 9B)
-- ==============================================================================

-- 1. Création de la table instructor_subscriptions
CREATE TABLE IF NOT EXISTS public.instructor_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'canceled', 'inactive')),
  plan TEXT NOT NULL DEFAULT 'monthly' CHECK (plan IN ('monthly', 'yearly')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  provider TEXT,
  provider_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour accélérer les requêtes par formateur
CREATE INDEX IF NOT EXISTS idx_instructor_subscriptions_instructor_id
  ON public.instructor_subscriptions(instructor_id);

-- 2. Règle d'unicité : un formateur ne peut avoir qu'UN SEUL abonnement 'active' simultané
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_subscription
  ON public.instructor_subscriptions(instructor_id)
  WHERE (status = 'active');

-- 3. Activation du Row Level Security (RLS)
ALTER TABLE public.instructor_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : Chaque formateur ne peut lire QUE son propre abonnement
-- Un formateur A ne peut pas lire l'abonnement du formateur B.
-- Un élève ne peut pas lire les abonnements des formateurs.
CREATE POLICY "Instructors can view own subscription"
  ON public.instructor_subscriptions
  FOR SELECT
  USING (
    instructor_id = auth.uid()
    AND public.is_instructor(auth.uid())
  );

-- Politique d'insertion/mise à jour sécurisée :
-- Seul le service serveur (webhook / service_role) peut activer un abonnement après paiement vérifié
CREATE POLICY "Service role manages subscriptions"
  ON public.instructor_subscriptions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- 4. Trigger anti-falsification côté base de données
-- Empêche formellement un utilisateur d'injecter ou modifier directement son statut en 'active'
CREATE OR REPLACE FUNCTION public.prevent_subscription_tampering()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'opération ne provient pas du service_role
  IF COALESCE(auth.jwt()->>'role', '') <> 'service_role' THEN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
      RAISE EXCEPTION 'L activation d un abonnement nécessite une confirmation de paiement serveur.';
    END IF;

    IF TG_OP = 'UPDATE' AND (NEW.status = 'active' AND OLD.status <> 'active') THEN
      RAISE EXCEPTION 'Modification non autorisée du statut d abonnement.';
    END IF;

    IF TG_OP = 'UPDATE' AND (NEW.expires_at > OLD.expires_at) THEN
      RAISE EXCEPTION 'Prolongation non autorisée de la date d expiration.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_subscription_tampering ON public.instructor_subscriptions;
CREATE TRIGGER tr_prevent_subscription_tampering
  BEFORE INSERT OR UPDATE ON public.instructor_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_subscription_tampering();
