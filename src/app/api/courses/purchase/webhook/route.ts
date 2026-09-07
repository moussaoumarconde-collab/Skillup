import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payments/fedapay';
import { createAdminClient } from '@/lib/supabase/admin';
import { grantCourseAccess } from '@/lib/courses/access';
import { creditInstructorWallet } from '@/lib/wallet';

/**
 * POST /api/courses/purchase/webhook
 *
 * Réception des événements de paiement FedaPay pour les achats de formations.
 *
 * Sécurité & Idempotence :
 * 1. Vérification de la signature cryptographique X-FEDAPAY-SIGNATURE.
 * 2. Idempotence stricte : transaction déjà traitée → 200 sans doublon.
 * 3. Accès accordé UNIQUEMENT si statut FedaPay = 'approved'.
 * 4. Formateur crédité à 100% + payout automatique tenté.
 *
 * NOTE : Ce webhook est SÉPARÉ du webhook abonnement formateur (Phase 9C).
 * On distingue les deux via custom_metadata.type === 'course_purchase'.
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-fedapay-signature');
    const rawBody = await request.text();

    // 1. Vérification de la signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[Course Webhook] Signature invalide rejetée.');
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Payload JSON malformé' }, { status: 400 });
    }

    const entity = (payload.entity || payload.transaction || payload) as Record<
      string,
      unknown
    >;

    const transactionId = String(entity.id || '');
    const transactionStatus = String(entity.status || '').toLowerCase();
    const transactionAmount = Number(entity.amount || 0);
    const metadata = (entity.custom_metadata || {}) as Record<string, unknown>;

    // Vérifier que c'est bien un achat de formation (pas un abonnement)
    if (metadata.type !== 'course_purchase') {
      // Ce n'est pas un achat de formation, ignorer (le webhook abonnement s'en charge)
      return NextResponse.json({
        status: 'ignored',
        message: 'Événement non lié à un achat de formation.',
      });
    }

    const studentId = String(metadata.student_id || '');
    const courseId = String(metadata.course_id || '');
    const rawInstructorId = String(metadata.instructor_id || '');
    const isValidUuid = (val?: string | null) =>
      !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const instructorId = isValidUuid(rawInstructorId) ? rawInstructorId : null;
    const courseTitle = String(metadata.course_title || 'Formation');

    if (!transactionId || !courseId) {
      return NextResponse.json(
        { error: 'Données de transaction manquantes' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 2. IDEMPOTENCE STRICTE
    try {
      const { data: existingPurchase } = await admin
        .from('course_purchases')
        .select('*')
        .eq('provider_transaction_id', transactionId)
        .maybeSingle();

      if (existingPurchase && existingPurchase.status === 'successful') {
        return NextResponse.json({
          status: 'success',
          message: 'Transaction déjà traitée (Idempotence respectée).',
        });
      }
    } catch (err) {
      console.warn('Idempotence check notice (mode local):', err);
    }

    // 3. Transaction approuvée
    if (transactionStatus === 'approved') {
      let purchaseId: string | null = null;

      try {
        // Enregistrer/mettre à jour l'achat comme successful
        const { data: purchaseData } = await admin
          .from('course_purchases')
          .upsert(
            {
              student_id: studentId,
              course_id: courseId,
              instructor_id: instructorId,
              amount: transactionAmount,
              currency: 'XOF',
              provider: 'fedapay',
              provider_transaction_id: transactionId,
              status: 'successful',
              raw_response: entity,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'provider_transaction_id' }
          )
          .select('id')
          .single();

        purchaseId = purchaseData?.id || null;
      } catch (dbErr) {
        console.warn('Enregistrement purchase webhook (mode local):', dbErr);
      }

      // Accorder l'accès à la formation
      if (studentId && courseId) {
        await grantCourseAccess(studentId, courseId, purchaseId);
      }

      // Créditer le formateur (100%) + payout automatique
      if (instructorId && purchaseId) {
        await creditInstructorWallet(
          instructorId,
          transactionAmount,
          purchaseId,
          courseTitle
        );
      }

      return NextResponse.json({
        status: 'success',
        message: 'Achat confirmé. Accès accordé et formateur crédité.',
        transactionId,
        studentId,
        courseId,
      });
    }

    // 4. Transaction échouée ou annulée
    if (
      transactionStatus === 'declined' ||
      transactionStatus === 'canceled' ||
      transactionStatus === 'failed'
    ) {
      try {
        await admin
          .from('course_purchases')
          .upsert(
            {
              student_id: studentId,
              course_id: courseId,
              instructor_id: instructorId,
              amount: transactionAmount,
              currency: 'XOF',
              provider: 'fedapay',
              provider_transaction_id: transactionId,
              status: transactionStatus === 'canceled' ? 'canceled' : 'failed',
              raw_response: entity,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'provider_transaction_id' }
          );
      } catch (dbErr) {
        console.warn('Mise à jour échec achat:', dbErr);
      }

      return NextResponse.json({
        status: 'processed',
        message: `Paiement marqué comme ${transactionStatus}. Aucun accès accordé.`,
      });
    }

    // Tout autre statut
    return NextResponse.json({
      status: 'received',
      message: `Statut reçu: ${transactionStatus}. En attente de finalisation.`,
    });
  } catch (error) {
    console.error('Erreur traitement webhook achat:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors du traitement du webhook' },
      { status: 500 }
    );
  }
}
