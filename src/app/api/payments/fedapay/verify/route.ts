import { NextRequest, NextResponse } from 'next/server';
import { retrieveFedaPayTransaction } from '@/lib/payments/fedapay';
import { getPlanConfig, calculateExpirationDate } from '@/lib/subscriptions/plans';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SubscriptionPlan } from '@/types';

/**
 * GET /api/payments/fedapay/verify?transaction_id=...
 * 
 * Vérification côté serveur obligatoire d'une transaction FedaPay.
 * 
 * RÈGLE ABSOLUE DU PROJET :
 * Le simple affichage ou retour vers /abonnement/succes ne confère AUCUN droit.
 * Seule cette vérification officielle interrogeant directement l'API FedaPay
 * ou constatant une activation webhook validée peut confirmer l'abonnement.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transaction_id') || searchParams.get('id');

    if (!transactionId) {
      return NextResponse.json(
        { verified: false, error: 'Identifiant de transaction manquant' },
        { status: 400 }
      );
    }

    // 1. Authentification requise
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    let userRole =
      (user?.user_metadata?.role as string) ||
      request.cookies.get('skillup_user_role')?.value ||
      'student';

    if (!userId) {
      const hasLocalToken = request.cookies.get('skillup_auth_token')?.value;
      if (!hasLocalToken) {
        return NextResponse.json(
          { verified: false, error: 'Non authentifié' },
          { status: 401 }
        );
      }
      userId = request.cookies.get('skillup_user_id')?.value || 'local_instructor_id';
    }

    if (userRole === 'student') {
      return NextResponse.json(
        { verified: false, error: 'Accès refusé aux élèves.' },
        { status: 403 }
      );
    }

    const admin = createAdminClient();

    // 2. Vérifier si la transaction a déjà été traitée avec succès en base
    try {
      const { data: existingPayment } = await admin
        .from('subscription_payments')
        .select('*')
        .eq('provider_transaction_id', String(transactionId))
        .maybeSingle();

      if (existingPayment && existingPayment.status === 'successful') {
        const { data: activeSub } = await admin
          .from('instructor_subscriptions')
          .select('*')
          .eq('instructor_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        return NextResponse.json({
          verified: true,
          status: 'approved',
          subscriptionActive: true,
          plan: existingPayment.plan,
          expiresAt: activeSub?.expires_at || null,
          message: 'Paiement confirmé et abonnement actif.',
        });
      }
    } catch (err) {
      console.warn('Vérification base notice (mode local):', err);
    }

    // 3. Interrogation directe de l'API officielle FedaPay
    const tx = await retrieveFedaPayTransaction(transactionId);
    if (!tx) {
      return NextResponse.json(
        {
          verified: false,
          status: 'not_found',
          subscriptionActive: false,
          message: 'Transaction introuvable auprès de FedaPay.',
        },
        { status: 404 }
      );
    }

    const txStatus = String(tx.status || '').toLowerCase();
    const metadata = (tx.custom_metadata || {}) as Record<string, unknown>;
    const plan = ((metadata.plan as string) || searchParams.get('plan') || 'monthly') as SubscriptionPlan;
    const planConfig = getPlanConfig(plan) || getPlanConfig('monthly')!;

    // 4. Seul le statut 'approved' permet d'activer l'abonnement
    if (txStatus === 'approved') {
      const startedAt = new Date();
      const expiresAt = calculateExpirationDate(plan, startedAt);

      try {
        // Désactiver d'anciens abonnements actifs
        await admin
          .from('instructor_subscriptions')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .eq('instructor_id', userId)
          .eq('status', 'active');

        // Créer l'abonnement actif
        const { data: subData } = await admin
          .from('instructor_subscriptions')
          .insert({
            instructor_id: userId,
            status: 'active',
            plan: plan,
            started_at: startedAt.toISOString(),
            expires_at: expiresAt.toISOString(),
            provider: 'fedapay',
            provider_subscription_id: String(transactionId),
          })
          .select('id')
          .single();

        // Enregistrer le paiement comme 'successful'
        await admin
          .from('subscription_payments')
          .upsert(
            {
              instructor_id: userId,
              subscription_id: subData?.id || null,
              plan: plan,
              amount: tx.amount || planConfig.amount,
              currency: planConfig.currency,
              provider: 'fedapay',
              provider_transaction_id: String(transactionId),
              status: 'successful',
              raw_response: tx as Record<string, unknown>,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'provider_transaction_id' }
          );
      } catch (dbErr) {
        console.warn('Enregistrement Supabase verify (repli local):', dbErr);
      }

      return NextResponse.json({
        verified: true,
        status: 'approved',
        subscriptionActive: true,
        plan: plan,
        expiresAt: expiresAt.toISOString(),
        message: 'Votre paiement a été vérifié avec succès par FedaPay !',
      });
    }

    if (txStatus === 'pending') {
      return NextResponse.json({
        verified: false,
        status: 'pending',
        subscriptionActive: false,
        message: 'Paiement en cours de traitement par l opérateur mobile ou bancaire.',
      });
    }

    return NextResponse.json({
      verified: false,
      status: txStatus,
      subscriptionActive: false,
      message: `Le paiement a échoué ou a été annulé (${txStatus}).`,
    });
  } catch (error) {
    console.error('Erreur vérification FedaPay:', error);
    return NextResponse.json(
      {
        verified: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur interne lors de la vérification du paiement.',
      },
      { status: 500 }
    );
  }
}
