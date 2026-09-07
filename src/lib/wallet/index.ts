/**
 * SKILLUP - SERVICE PORTEFEUILLE FORMATEUR (PHASE 9D)
 *
 * Gère le portefeuille financier de chaque formateur.
 * Toutes les opérations passent par le client admin (service_role).
 *
 * Règles absolues V1 :
 * - Le formateur reçoit 100% du prix de la formation (0% commission SkillUp).
 * - Les informations Mobile Money sont stockées dans la table dédiée instructor_payout_accounts.
 * - Le reversement est automatique après confirmation réelle du paiement.
 * - Si FedaPay Payout n'est pas activé ou échoue :
 *   * Ne JAMAIS simuler un transfert réussi.
 *   * Ne JAMAIS afficher "argent reçu".
 *   * Conserver le montant dans pending_balance (solde en attente).
 *   * Enregistrer la raison exacte de l'échec dans wallet_transactions.
 *   * Permettre une nouvelle tentative sécurisée (retryPayout).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { createFedaPayPayout } from '@/lib/payments/payouts';
import {
  InstructorWallet,
  WalletTransaction,
  InstructorPayoutAccount,
  PayoutMode,
} from '@/types';

/**
 * Récupère ou initialise le portefeuille d'un formateur
 */
export async function getOrCreateWallet(
  instructorId: string
): Promise<InstructorWallet | null> {
  const admin = createAdminClient();

  try {
    const { data: existing } = await admin
      .from('instructor_wallets')
      .select('*')
      .eq('instructor_id', instructorId)
      .maybeSingle();

    if (existing) {
      return existing as InstructorWallet;
    }

    const { data: created, error } = await admin
      .from('instructor_wallets')
      .insert({
        instructor_id: instructorId,
        available_balance: 0,
        pending_balance: 0,
        total_earned: 0,
        currency: 'XOF',
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        // En cas de race condition, récupérer le portefeuille créé en parallèle
        const { data: reFetched } = await admin
          .from('instructor_wallets')
          .select('*')
          .eq('instructor_id', instructorId)
          .maybeSingle();
        return reFetched as InstructorWallet;
      }
      console.error('[Wallet] Erreur création portefeuille:', error);
      return null;
    }

    return created as InstructorWallet;
  } catch (err) {
    console.warn('[Wallet] Erreur getOrCreateWallet (mode local):', err);
    return null;
  }
}

// Cache en mémoire pour le développement local et les tests
const localPayoutAccounts = new Map<string, InstructorPayoutAccount>();

/**
 * Récupère le compte de reversement Mobile Money d'un formateur (table dédiée)
 */
export async function getInstructorPayoutAccount(
  instructorId: string
): Promise<InstructorPayoutAccount | null> {
  const admin = createAdminClient();

  try {
    const { data, error } = await admin
      .from('instructor_payout_accounts')
      .select('*')
      .eq('instructor_id', instructorId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return localPayoutAccounts.get(instructorId) || null;
    }

    return (data as InstructorPayoutAccount | null) || localPayoutAccounts.get(instructorId) || null;
  } catch (err) {
    return localPayoutAccounts.get(instructorId) || null;
  }
}

/**
 * Enregistre ou met à jour les coordonnées Mobile Money du formateur
 */
export async function saveInstructorPayoutAccount(
  instructorId: string,
  params: {
    payout_mode: PayoutMode;
    phone_number: string;
    account_name?: string;
    country?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();

  const accountObj: InstructorPayoutAccount = {
    id: `payout_acc_${instructorId}`,
    instructor_id: instructorId,
    payout_mode: params.payout_mode,
    phone_number: params.phone_number.trim(),
    account_name: params.account_name?.trim() || null,
    country: params.country || 'BJ',
    updated_at: new Date().toISOString(),
  };

  // Sauvegarder dans le cache local
  localPayoutAccounts.set(instructorId, accountObj);

  try {
    const { error } = await admin
      .from('instructor_payout_accounts')
      .upsert(
        {
          instructor_id: instructorId,
          payout_mode: params.payout_mode,
          phone_number: params.phone_number.trim(),
          account_name: params.account_name?.trim() || null,
          country: params.country || 'BJ',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'instructor_id' }
      );

    if (error) {
      console.warn('[Wallet] Notice BD saveInstructorPayoutAccount (mode local actif):', error.message || error);
    }

    return { success: true };
  } catch (err) {
    console.warn('[Wallet] Notice locale saveInstructorPayoutAccount:', err);
    return { success: true };
  }
}

/**
 * Crédite 100% de la vente au formateur puis déclenche le reversement automatique.
 * Idempotent : ne crédite et ne reverse jamais deux fois la même vente.
 */
export async function creditInstructorWallet(
  instructorId: string,
  amount: number,
  purchaseId: string,
  courseTitle: string
): Promise<{
  success: boolean;
  payoutAttempted: boolean;
  payoutSuccess: boolean;
  payoutReason?: string;
}> {
  const admin = createAdminClient();

  try {
    // 1. Récupérer ou initialiser le portefeuille
    const wallet = await getOrCreateWallet(instructorId);
    if (!wallet) {
      console.error('[Wallet] Portefeuille introuvable pour:', instructorId);
      return {
        success: false,
        payoutAttempted: false,
        payoutSuccess: false,
        payoutReason: 'Portefeuille introuvable',
      };
    }

    // 2. Vérifier l'idempotence sur cette vente
    const { data: existingTx } = await admin
      .from('wallet_transactions')
      .select('id')
      .eq('purchase_id', purchaseId)
      .eq('type', 'credit_sale')
      .maybeSingle();

    if (existingTx) {
      // Déjà traité
      return {
        success: true,
        payoutAttempted: false,
        payoutSuccess: false,
        payoutReason: 'Vente déjà traitée (idempotence)',
      };
    }

    // 3. Créditer 100 % du montant dans pending_balance et total_earned
    const updatedPending = wallet.pending_balance + amount;
    const updatedTotal = wallet.total_earned + amount;

    await admin
      .from('instructor_wallets')
      .update({
        pending_balance: updatedPending,
        total_earned: updatedTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    // 4. Inscription immuable dans le ledger (credit_sale)
    await admin.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      instructor_id: instructorId,
      type: 'credit_sale',
      amount: amount,
      currency: 'XOF',
      purchase_id: purchaseId,
      description: `Vente 100% formateur: ${courseTitle}`,
    });

    // 5. Tentative de reversement automatique via FedaPay
    const payoutRes = await attemptAutoPayout(
      instructorId,
      amount,
      purchaseId,
      wallet.id,
      courseTitle,
      updatedPending
    );

    return {
      success: true,
      payoutAttempted: payoutRes.attempted,
      payoutSuccess: payoutRes.success,
      payoutReason: payoutRes.reason,
    };
  } catch (err) {
    console.error('[Wallet] Erreur creditInstructorWallet:', err);
    return {
      success: false,
      payoutAttempted: false,
      payoutSuccess: false,
      payoutReason: err instanceof Error ? err.message : 'Erreur interne',
    };
  }
}

/**
 * Tente un reversement automatique vers le Mobile Money du formateur.
 * RÈGLE ABSOLUE :
 * Si le reversement échoue, le montant reste en pending_balance,
 * le statut failed est enregistré avec la raison exacte.
 */
async function attemptAutoPayout(
  instructorId: string,
  amount: number,
  purchaseId: string,
  walletId: string,
  courseTitle: string,
  currentPendingBalance: number
): Promise<{ attempted: boolean; success: boolean; reason?: string }> {
  const admin = createAdminClient();

  try {
    // A. Récupérer les coordonnées Mobile Money dans la table dédiée
    const payoutAccount = await getInstructorPayoutAccount(instructorId);

    if (!payoutAccount?.phone_number || !payoutAccount?.payout_mode) {
      const reason =
        'Coordonnées Mobile Money non configurées par le formateur. Gains conservés en solde en attente.';
      // Enregistrer l'échec dans le ledger
      await admin.from('wallet_transactions').insert({
        wallet_id: walletId,
        instructor_id: instructorId,
        type: 'payout',
        amount: amount,
        currency: 'XOF',
        purchase_id: purchaseId,
        payout_status: 'failed',
        description: `Reversement non exécuté: ${reason}`,
      });

      return { attempted: false, success: false, reason };
    }

    // Récupérer les informations de profil pour le nom de contact FedaPay
    const { data: profile } = await admin
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', instructorId)
      .maybeSingle();

    // B. Exécution du reversement via FedaPay
    const payout = await createFedaPayPayout({
      amount,
      currency: 'XOF',
      mode: payoutAccount.payout_mode,
      customer: {
        firstname: profile?.first_name || payoutAccount.account_name || 'Formateur',
        lastname: profile?.last_name || 'SkillUp',
        email: profile?.email || 'contact@skillup.com',
        phoneNumber: payoutAccount.phone_number,
      },
      merchantReference: `sale_${purchaseId.slice(0, 18)}`,
    });

    // C. Si FedaPay a accepté le payout (status sent / approved / processing)
    const isSuccess =
      payout.status === 'sent' ||
      payout.status === 'approved' ||
      payout.status === 'processing';

    if (isSuccess) {
      // Déduire du solde en attente car le transfert a été envoyé
      await admin
        .from('instructor_wallets')
        .update({
          pending_balance: Math.max(0, currentPendingBalance - amount),
          updated_at: new Date().toISOString(),
        })
        .eq('id', walletId);

      await admin.from('wallet_transactions').insert({
        wallet_id: walletId,
        instructor_id: instructorId,
        type: 'payout',
        amount: amount,
        currency: 'XOF',
        purchase_id: purchaseId,
        payout_provider_id: String(payout.id),
        payout_status: 'processing',
        description: `Reversement automatique FedaPay vers ${payoutAccount.phone_number} (${payoutAccount.payout_mode})`,
      });

      return { attempted: true, success: true };
    } else {
      // Statut inattendu renvoyé par FedaPay
      const reason = `FedaPay a retourné le statut: ${payout.status}`;
      await admin.from('wallet_transactions').insert({
        wallet_id: walletId,
        instructor_id: instructorId,
        type: 'payout',
        amount: amount,
        currency: 'XOF',
        purchase_id: purchaseId,
        payout_provider_id: String(payout.id),
        payout_status: 'failed',
        description: `Échec reversement automatique: ${reason}`,
      });

      return { attempted: true, success: false, reason };
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Erreur API FedaPay';
    console.warn('[Payout] Échec du reversement automatique:', reason);

    // Enregistrer l'échec et la raison exacte sans modifier pending_balance
    await admin.from('wallet_transactions').insert({
      wallet_id: walletId,
      instructor_id: instructorId,
      type: 'payout',
      amount: amount,
      currency: 'XOF',
      purchase_id: purchaseId,
      payout_status: 'failed',
      description: `Échec reversement automatique: ${reason}`,
    });

    return { attempted: true, success: false, reason };
  }
}

/**
 * Nouvelle tentative sécurisée pour un reversement ayant échoué
 */
export async function retryPayout(
  instructorId: string,
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();

  try {
    // 1. Vérifier la transaction
    const { data: tx, error: txErr } = await admin
      .from('wallet_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('instructor_id', instructorId)
      .eq('type', 'payout')
      .single();

    if (txErr || !tx) {
      return { success: false, error: 'Transaction introuvable.' };
    }

    if (tx.payout_status !== 'failed') {
      return {
        success: false,
        error: 'Seules les transactions en échec peuvent être retentées.',
      };
    }

    // 2. Vérifier les coordonnées Mobile Money
    const payoutAccount = await getInstructorPayoutAccount(instructorId);
    if (!payoutAccount?.phone_number || !payoutAccount?.payout_mode) {
      return {
        success: false,
        error:
          'Veuillez d abord renseigner vos coordonnées Mobile Money de reversement.',
      };
    }

    // 3. Récupérer le profil
    const { data: profile } = await admin
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', instructorId)
      .maybeSingle();

    // 4. Exécuter le payout via FedaPay
    const payout = await createFedaPayPayout({
      amount: tx.amount,
      currency: 'XOF',
      mode: payoutAccount.payout_mode,
      customer: {
        firstname: profile?.first_name || payoutAccount.account_name || 'Formateur',
        lastname: profile?.last_name || 'SkillUp',
        email: profile?.email || 'contact@skillup.com',
        phoneNumber: payoutAccount.phone_number,
      },
      merchantReference: `retry_${tx.id.slice(0, 18)}`,
    });

    const isSuccess =
      payout.status === 'sent' ||
      payout.status === 'approved' ||
      payout.status === 'processing';

    if (isSuccess) {
      // Mettre à jour la transaction existante
      await admin
        .from('wallet_transactions')
        .update({
          payout_provider_id: String(payout.id),
          payout_status: 'processing',
          description: `Reversement réussi (nouvelle tentative) vers ${payoutAccount.phone_number}`,
        })
        .eq('id', tx.id);

      // Déduire du solde en attente
      const wallet = await getOrCreateWallet(instructorId);
      if (wallet) {
        await admin
          .from('instructor_wallets')
          .update({
            pending_balance: Math.max(0, wallet.pending_balance - tx.amount),
            updated_at: new Date().toISOString(),
          })
          .eq('id', wallet.id);
      }

      return { success: true };
    } else {
      await admin
        .from('wallet_transactions')
        .update({
          description: `Nouvelle tentative échouée: statut ${payout.status}`,
        })
        .eq('id', tx.id);

      return {
        success: false,
        error: `FedaPay a retourné le statut: ${payout.status}`,
      };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erreur API FedaPay';
    return { success: false, error: errorMsg };
  }
}

/**
 * Récupère l'ensemble des données financières pour le tableau de bord formateur :
 * - Portefeuille (total_earned, pending_balance, available_balance)
 * - Coordonnées Mobile Money
 * - Historique des transactions
 */
export async function getInstructorFinancialOverview(instructorId: string) {
  const admin = createAdminClient();

  const wallet = await getOrCreateWallet(instructorId);
  const payoutAccount = await getInstructorPayoutAccount(instructorId);

  let transactions: WalletTransaction[] = [];
  try {
    const { data } = await admin
      .from('wallet_transactions')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false })
      .limit(50);

    transactions = (data as WalletTransaction[]) || [];
  } catch (err) {
    console.warn('[Wallet] Notice chargement transactions:', err);
  }

  return {
    wallet,
    payoutAccount,
    transactions,
  };
}
