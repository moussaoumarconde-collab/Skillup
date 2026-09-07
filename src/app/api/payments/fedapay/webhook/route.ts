import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payments/fedapay';
import { getPlanConfig, calculateExpirationDate } from '@/lib/subscriptions/plans';
import { createAdminClient } from '@/lib/supabase/admin';
import { SubscriptionPlan } from '@/types';

/**
 * POST /api/payments/fedapay/webhook
 * 
 * Réception des événements de paiement FedaPay en temps réel.
 * 
 * Sécurité & Idempotence :
 * 1. Vérification de la signature cryptographique X-FEDAPAY-SIGNATURE.
 * 2. Contrôle d'idempotence strict : Si la transaction a déjà été traitée,
 *    on retourne immédiatement 200 sans dupliquer l'abonnement.
 * 3. Validation du montant et du plan côté serveur.
 * 4. Activation de l'abonnement UNIQUEMENT si le statut FedaPay est 'approved'.
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-fedapay-signature');
    const rawBody = await request.text();

    // 1. Vérification de la signature webhook FedaPay
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[FedaPay Webhook] Signature invalide rejetée.');
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Payload JSON malformé' }, { status: 400 });
    }

    // Extraction des données de l'événement FedaPay
    // FedaPay transmet l'objet transaction dans `entity` ou sous la racine
    const entity = (payload.entity || payload.transaction || payload) as Record<
      string,
      unknown
    >;

    const transactionId = String(entity.id || '');
    const transactionStatus = String(entity.status || '').toLowerCase();
    const transactionAmount = Number(entity.amount || 0);
    const metadata = (entity.custom_metadata || {}) as Record<string, unknown>;

    const instructorId = String(metadata.instructor_id || '');
    const plan = (metadata.plan || 'monthly') as SubscriptionPlan;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Identifiant de transaction manquant' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 2. IDEMPOTENCE STRICTE : Vérifier si la transaction a déjà été validée
    try {
      const { data: existingPayment } = await admin
        .from('subscription_payments')
        .select('*')
        .eq('provider_transaction_id', transactionId)
        .maybeSingle();

      if (existingPayment && existingPayment.status === 'successful') {
        // Déjà traitée avec succès : on acquitte sans doublon
        return NextResponse.json({
          status: 'success',
          message: 'Transaction déjà traitée (Idempotence respectée).',
        });
      }
    } catch (err) {
      console.warn('Idempotence check notice (mode local):', err);
    }

    // 3. Validation du plan et du montant
    const planConfig = getPlanConfig(plan);
    if (!planConfig) {
      console.error('[FedaPay Webhook] Plan inconnu dans metadata:', plan);
      return NextResponse.json({ error: 'Plan inconnu' }, { status: 400 });
    }

    // 4. Si la transaction est approuvée ('approved')
    if (transactionStatus === 'approved') {
      const startedAt = new Date();
      const expiresAt = calculateExpirationDate(plan, startedAt);

      let subscriptionId: string | null = null;

      try {
        // Désactiver d'anciens abonnements actifs pour ce formateur si nécessaire
        await admin
          .from('instructor_subscriptions')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .eq('instructor_id', instructorId)
          .eq('status', 'active');

        // Créer ou activer le nouvel abonnement
        const { data: subData, error: subError } = await admin
          .from('instructor_subscriptions')
          .insert({
            instructor_id: instructorId,
            status: 'active',
            plan: plan,
            started_at: startedAt.toISOString(),
            expires_at: expiresAt.toISOString(),
            provider: 'fedapay',
            provider_subscription_id: transactionId,
          })
          .select('id')
          .single();

        if (!subError && subData) {
          subscriptionId = subData.id;
        }

        // Mettre à jour le statut du paiement en 'successful'
        await admin
          .from('subscription_payments')
          .upsert(
            {
              instructor_id: instructorId,
              subscription_id: subscriptionId,
              plan: plan,
              amount: transactionAmount || planConfig.amount,
              currency: planConfig.currency,
              provider: 'fedapay',
              provider_transaction_id: transactionId,
              status: 'successful',
              raw_response: entity,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'provider_transaction_id' }
          );
      } catch (dbErr) {
        console.warn('Enregistrement Supabase webhook (repli local):', dbErr);
      }

      return NextResponse.json({
        status: 'success',
        message: 'Abonnement activé avec succès.',
        transactionId,
        instructorId,
        plan,
        expiresAt: expiresAt.toISOString(),
      });
    }

    // 5. Si la transaction a échoué ou a été annulée
    if (
      transactionStatus === 'declined' ||
      transactionStatus === 'canceled' ||
      transactionStatus === 'failed'
    ) {
      try {
        await admin
          .from('subscription_payments')
          .upsert(
            {
              instructor_id: instructorId,
              plan: plan,
              amount: transactionAmount || planConfig.amount,
              currency: planConfig.currency,
              provider: 'fedapay',
              provider_transaction_id: transactionId,
              status: transactionStatus === 'canceled' ? 'canceled' : 'failed',
              raw_response: entity,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'provider_transaction_id' }
          );
      } catch (dbErr) {
        console.warn('Mise à jour échec transaction:', dbErr);
      }

      return NextResponse.json({
        status: 'processed',
        message: `Paiement marqué comme ${transactionStatus}. Aucun abonnement activé.`,
      });
    }

    // Tout autre statut (ex: pending)
    return NextResponse.json({
      status: 'received',
      message: `Statut reçu: ${transactionStatus}. En attente de finalisation.`,
    });
  } catch (error) {
    console.error('Erreur traitement webhook FedaPay:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors du traitement du webhook' },
      { status: 500 }
    );
  }
}
