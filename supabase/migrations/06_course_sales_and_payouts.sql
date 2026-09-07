-- ==============================================================================
-- SKILLUP - MIGRATION 06 : VENTE DE FORMATIONS, ACCÈS & PORTEFEUILLE (PHASE 9D)
-- ==============================================================================
-- Règle financière V1 : 0% commission SkillUp, 100% au formateur.
-- Cette migration est STRICTEMENT SÉPARÉE des abonnements formateurs (Migration 05).
-- Table dédiée pour les informations de paiement Mobile Money (pas dans profiles).
-- ==============================================================================

-- ============================================================
-- 1. TABLE DÉDIÉE : instructor_payout_accounts
-- Stocke les informations Mobile Money du formateur pour le reversement.
-- Séparée de la table profiles conformément aux exigences de sécurité financière.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.instructor_payout_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  payout_mode TEXT NOT NULL CHECK (
    payout_mode IN (
      'mtn_open', 'moov', 'togocel', 'moov_tg',
      'orange_ci', 'mtn_ci', 'wave_ci'
    )
  ),
  phone_number TEXT NOT NULL,
  account_name TEXT,
  country TEXT NOT NULL DEFAULT 'BJ',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payout_accounts_instructor ON public.instructor_payout_accounts(instructor_id);

ALTER TABLE public.instructor_payout_accounts ENABLE ROW LEVEL SECURITY;

-- Le formateur peut voir son propre compte de reversement
CREATE POLICY "Instructors can view own payout account"
  ON public.instructor_payout_accounts
  FOR SELECT
  USING (instructor_id = auth.uid() AND public.is_instructor(auth.uid()));

-- Le formateur peut configurer / mettre à jour son propre compte de reversement
CREATE POLICY "Instructors can upsert own payout account"
  ON public.instructor_payout_accounts
  FOR ALL
  USING (instructor_id = auth.uid() AND public.is_instructor(auth.uid()))
  WITH CHECK (instructor_id = auth.uid() AND public.is_instructor(auth.uid()));

-- Le rôle service peut tout gérer
CREATE POLICY "Service role manages payout accounts"
  ON public.instructor_payout_accounts
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');


-- ============================================================
-- 2. TABLE : course_purchases
-- Enregistre chaque transaction d'achat d'une formation par un élève.
-- provider_transaction_id est UNIQUE pour l'idempotence stricte.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'XOF',
  provider TEXT NOT NULL DEFAULT 'fedapay',
  provider_transaction_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'canceled')),
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_course_purchases_student ON public.course_purchases(student_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_course ON public.course_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_instructor ON public.course_purchases(instructor_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_provider_tx ON public.course_purchases(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_status ON public.course_purchases(status);

ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;

-- L'élève peut voir ses propres achats
CREATE POLICY "Students can view own purchases"
  ON public.course_purchases
  FOR SELECT
  USING (student_id = auth.uid());

-- Le formateur peut voir les achats de ses formations
CREATE POLICY "Instructors can view purchases of own courses"
  ON public.course_purchases
  FOR SELECT
  USING (instructor_id = auth.uid() AND public.is_instructor(auth.uid()));

-- Seul le service serveur peut insérer / modifier
CREATE POLICY "Service role manages course purchases"
  ON public.course_purchases
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');


-- ============================================================
-- 3. TABLE : course_access
-- Table de vérité définitive : l'élève a-t-il accès ?
-- Contrainte UNIQUE (student_id, course_id) = pas de doublon.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  purchase_id UUID REFERENCES public.course_purchases(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_access_student ON public.course_access(student_id);
CREATE INDEX IF NOT EXISTS idx_course_access_course ON public.course_access(course_id);

ALTER TABLE public.course_access ENABLE ROW LEVEL SECURITY;

-- L'élève ne peut voir que ses propres accès
CREATE POLICY "Students can view own access"
  ON public.course_access
  FOR SELECT
  USING (student_id = auth.uid());

-- Seul le service serveur peut accorder un accès
CREATE POLICY "Service role manages course access"
  ON public.course_access
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');


-- ============================================================
-- 4. TABLE : instructor_wallets
-- Portefeuille financier de chaque formateur.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.instructor_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  available_balance INTEGER NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  pending_balance INTEGER NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  currency TEXT NOT NULL DEFAULT 'XOF',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.instructor_wallets ENABLE ROW LEVEL SECURITY;

-- Le formateur peut voir uniquement son propre portefeuille
CREATE POLICY "Instructors can view own wallet"
  ON public.instructor_wallets
  FOR SELECT
  USING (instructor_id = auth.uid() AND public.is_instructor(auth.uid()));

-- Seul le service serveur peut modifier le portefeuille
CREATE POLICY "Service role manages wallets"
  ON public.instructor_wallets
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');


-- ============================================================
-- 5. TABLE : wallet_transactions
-- Registre immuable (ledger) de chaque mouvement financier.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.instructor_wallets(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit_sale', 'payout', 'refund')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'XOF',
  purchase_id UUID REFERENCES public.course_purchases(id) ON DELETE SET NULL,
  payout_provider_id TEXT,
  payout_status TEXT CHECK (
    payout_status IS NULL OR payout_status IN ('pending', 'processing', 'successful', 'failed', 'canceled')
  ),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_instructor ON public.wallet_transactions(instructor_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_purchase ON public.wallet_transactions(purchase_id);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Le formateur peut voir ses propres transactions
CREATE POLICY "Instructors can view own wallet transactions"
  ON public.wallet_transactions
  FOR SELECT
  USING (instructor_id = auth.uid() AND public.is_instructor(auth.uid()));

-- Seul le service serveur peut insérer
CREATE POLICY "Service role manages wallet transactions"
  ON public.wallet_transactions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');


-- ============================================================
-- 6. TRIGGER ANTI-FALSIFICATION : course_access
-- Empêche un utilisateur de s'accorder un accès via le client
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_access_tampering()
RETURNS TRIGGER AS $$
BEGIN
  IF COALESCE(auth.jwt()->>'role', '') <> 'service_role' THEN
    RAISE EXCEPTION 'L accord d acces a une formation necessite une confirmation de paiement serveur.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_access_tampering ON public.course_access;
CREATE TRIGGER tr_prevent_access_tampering
  BEFORE INSERT ON public.course_access
  FOR EACH ROW EXECUTE FUNCTION public.prevent_access_tampering();


-- ============================================================
-- 7. TRIGGER ANTI-FALSIFICATION : instructor_wallets
-- Empêche un formateur de modifier son propre solde via le client
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_wallet_tampering()
RETURNS TRIGGER AS $$
BEGIN
  IF COALESCE(auth.jwt()->>'role', '') <> 'service_role' THEN
    IF NEW.available_balance IS DISTINCT FROM OLD.available_balance
       OR NEW.pending_balance IS DISTINCT FROM OLD.pending_balance
       OR NEW.total_earned IS DISTINCT FROM OLD.total_earned THEN
      RAISE EXCEPTION 'Modification non autorisee du solde du portefeuille.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_wallet_tampering ON public.instructor_wallets;
CREATE TRIGGER tr_prevent_wallet_tampering
  BEFORE UPDATE ON public.instructor_wallets
  FOR EACH ROW EXECUTE FUNCTION public.prevent_wallet_tampering();

-- ==============================================================================
-- FIN DE LA MIGRATION 06
-- ==============================================================================
