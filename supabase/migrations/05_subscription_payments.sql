-- ==============================================================================
-- SKILLUP - MIGRATION 05 : PAIEMENTS DES ABONNEMENTS FORMATEUR (PHASE 9C)
-- ==============================================================================

-- 1. Création de la table subscription_payments
-- Cette table enregistre les transactions de paiement de l'abonnement SkillUp formateur.
-- Elle est strictement séparée des futurs paiements des élèves aux formateurs.
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.instructor_subscriptions(id) ON DELETE SET NULL,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'XOF',
  provider TEXT NOT NULL DEFAULT 'fedapay',
  provider_transaction_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'canceled')),
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour accélérer la recherche par formateur et par transaction FedaPay
CREATE INDEX IF NOT EXISTS idx_subscription_payments_instructor_id
  ON public.subscription_payments(instructor_id);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_provider_tx
  ON public.subscription_payments(provider_transaction_id);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_status
  ON public.subscription_payments(status);

-- 2. Activation du Row Level Security (RLS)
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Politique SELECT : Chaque formateur ne peut consulter QUE ses propres paiements
-- Les élèves n'ont aucun accès à cette table.
CREATE POLICY "Instructors can view own payments"
  ON public.subscription_payments
  FOR SELECT
  USING (
    instructor_id = auth.uid()
    AND public.is_instructor(auth.uid())
  );

-- Politique INSERT/UPDATE : Seul le service serveur (service_role) peut insérer ou modifier
-- Empêche formellement tout utilisateur de falsifier un montant ou un statut depuis le client
CREATE POLICY "Service role manages subscription payments"
  ON public.subscription_payments
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
