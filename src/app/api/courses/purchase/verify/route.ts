import { NextRequest, NextResponse } from 'next/server';
import { retrieveFedaPayTransaction } from '@/lib/payments/fedapay';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { grantCourseAccess } from '@/lib/courses/access';
import { creditInstructorWallet } from '@/lib/wallet';

/**
 * GET /api/courses/purchase/verify?transaction_id=...
 *
 * Vérification côté serveur obligatoire d'un achat de formation via FedaPay.
 *
 * RÈGLE ABSOLUE :
 * Le simple retour vers /formations/achat/succes ne confère AUCUN accès.
 * Seule cette vérification serveur interrogeant FedaPay peut confirmer l'accès.
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

    // 1. Authentification
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    if (!userId) {
      const hasLocalToken = request.cookies.get('skillup_auth_token')?.value;
      if (!hasLocalToken) {
        return NextResponse.json(
          { verified: false, error: 'Non authentifié' },
          { status: 401 }
        );
      }
      userId = request.cookies.get('skillup_user_id')?.value || 'local_student_id';
    }

    const admin = createAdminClient();

    // 2. Vérifier si la transaction a déjà été traitée en base (idempotence)
    try {
      const { data: existingPurchase } = await admin
        .from('course_purchases')
        .select('*')
        .eq('provider_transaction_id', String(transactionId))
        .maybeSingle();

      if (existingPurchase && existingPurchase.status === 'successful') {
        return NextResponse.json({
          verified: true,
          status: 'approved',
          accessGranted: true,
          courseId: existingPurchase.course_id,
          message: 'Achat déjà confirmé. Vous avez accès à cette formation.',
        });
      }
    } catch (err) {
      console.warn('Vérification base notice (mode local):', err);
    }

    // 3. Interrogation directe de l'API FedaPay
    const tx = await retrieveFedaPayTransaction(transactionId);
    if (!tx) {
      return NextResponse.json(
        {
          verified: false,
          status: 'not_found',
          message: 'Transaction introuvable auprès de FedaPay.',
        },
        { status: 404 }
      );
    }

    const txStatus = String(tx.status || '').toLowerCase();
    const metadata = (tx.custom_metadata || {}) as Record<string, unknown>;
    const courseId = (metadata.course_id as string) || searchParams.get('course_id') || '';
    const rawInstructorId = (metadata.instructor_id as string) || '';
    const isValidUuid = (val?: string | null) =>
      !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const instructorId = isValidUuid(rawInstructorId) ? rawInstructorId : null;
    const courseTitle = (metadata.course_title as string) || '';

    // 4. Seul le statut 'approved' active l'accès
    if (txStatus === 'approved') {
      let purchaseId: string | null = null;

      try {
        // Mettre à jour ou insérer la purchase comme successful
        const { data: purchaseData } = await admin
          .from('course_purchases')
          .upsert(
            {
              student_id: userId,
              course_id: courseId,
              instructor_id: instructorId,
              amount: tx.amount || 0,
              currency: 'XOF',
              provider: 'fedapay',
              provider_transaction_id: String(transactionId),
              status: 'successful',
              raw_response: tx as Record<string, unknown>,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'provider_transaction_id' }
          )
          .select('id')
          .single();

        purchaseId = purchaseData?.id || null;
      } catch (dbErr) {
        console.warn('Enregistrement purchase verify (mode local):', dbErr);
      }

      // Accorder l'accès à la formation
      await grantCourseAccess(userId, courseId, purchaseId);

      // Créditer le formateur (100%) et tenter le payout automatique
      let dbCourse: { id: string; title: string; price: number; instructor_id: string } | null = null;
      try {
        const { data } = await admin
          .from('courses')
          .select('id, title, price, instructor_id')
          .eq('id', courseId)
          .maybeSingle();
        dbCourse = data;
      } catch (courseErr) {
        console.warn('Notice récupération cours verify:', courseErr);
      }

      const effectiveInstructorId = instructorId || dbCourse?.instructor_id;
      if (effectiveInstructorId && purchaseId) {
        await creditInstructorWallet(
          effectiveInstructorId,
          tx.amount || dbCourse?.price || 0,
          purchaseId,
          courseTitle || dbCourse?.title || 'Formation'
        );
      }

      return NextResponse.json({
        verified: true,
        status: 'approved',
        accessGranted: true,
        courseId,
        message: 'Votre paiement a été vérifié avec succès ! Vous avez maintenant accès à la formation.',
      });
    }

    if (txStatus === 'pending') {
      return NextResponse.json({
        verified: false,
        status: 'pending',
        accessGranted: false,
        message: 'Paiement en cours de traitement.',
      });
    }

    return NextResponse.json({
      verified: false,
      status: txStatus,
      accessGranted: false,
      message: `Le paiement a échoué ou a été annulé (${txStatus}).`,
    });
  } catch (error) {
    console.error('Erreur vérification achat:', error);
    return NextResponse.json(
      {
        verified: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur interne lors de la vérification de l achat.',
      },
      { status: 500 }
    );
  }
}
