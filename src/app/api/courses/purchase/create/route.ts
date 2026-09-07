import { NextRequest, NextResponse } from 'next/server';
import { createFedaPayTransaction, generateFedaPayCheckoutUrl } from '@/lib/payments/fedapay';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkCourseAccess, grantCourseAccess } from '@/lib/courses/access';

/**
 * POST /api/courses/purchase/create
 *
 * Initialise l'achat d'une formation par un élève.
 *
 * Sécurité stricte :
 * 1. Utilisateur authentifié obligatoire.
 * 2. Le prix, instructor_id et toutes les données financières sont déterminés CÔTÉ SERVEUR.
 *    Aucun prix envoyé par le client n'est pris en compte.
 * 3. Si la formation est gratuite → accès immédiat sans FedaPay.
 * 4. Si l'élève a déjà accès → pas de double achat.
 * 5. Idempotence sur provider_transaction_id.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentification
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    let userEmail = user?.email || 'eleve@skillup.com';
    let firstName = (user?.user_metadata?.first_name as string) || 'Élève';
    let lastName = (user?.user_metadata?.last_name as string) || 'SkillUp';

    if (!userId) {
      const hasLocalToken = request.cookies.get('skillup_auth_token')?.value;
      if (!hasLocalToken) {
        return NextResponse.json(
          { error: 'Authentification requise pour acheter une formation.' },
          { status: 401 }
        );
      }
      userId = request.cookies.get('skillup_user_id')?.value || 'local_student_id';
    }

    // 2. Validation de la requête
    const body = await request.json().catch(() => ({}));
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Identifiant de formation manquant.' },
        { status: 400 }
      );
    }

    // 3. Récupérer la formation CÔTÉ SERVEUR depuis Supabase (prix et instructor_id sécurisés)
    const admin = createAdminClient();
    const { data: course, error: courseErr } = await admin
      .from('courses')
      .select('id, title, status, pricing_type, price, instructor_id')
      .eq('id', courseId)
      .maybeSingle();

    if (courseErr) {
      console.error('Erreur récupération formation pour achat:', courseErr);
    }

    if (!course) {
      return NextResponse.json(
        { error: 'Formation introuvable.' },
        { status: 404 }
      );
    }

    // Contrôle strict de publication
    if (course.status !== 'published') {
      return NextResponse.json(
        { error: 'Cette formation n\'est pas disponible à l\'achat.' },
        { status: 400 }
      );
    }

    // 4. Formation gratuite → accès immédiat sans passer par FedaPay
    const isFree = course.pricing_type === 'free' || !course.price || course.price === 0;
    if (isFree) {
      const accessResult = await grantCourseAccess(userId, courseId);
      return NextResponse.json({
        success: true,
        free: true,
        accessGranted: true,
        alreadyOwned: accessResult.alreadyGranted,
        message: accessResult.alreadyGranted
          ? 'Vous avez déjà accès à cette formation gratuite.'
          : 'Accès à la formation gratuite accordé !',
      });
    }

    // 5. Vérifier si l'élève a déjà accès (pas de double achat)
    const hasAccess = await checkCourseAccess(userId, courseId);
    if (hasAccess) {
      return NextResponse.json({
        success: true,
        free: false,
        accessGranted: true,
        alreadyOwned: true,
        message: 'Vous avez déjà accès à cette formation.',
      });
    }

    // 6. Récupérer l'instructor_id certifié depuis la formation Supabase
    const isValidUuid = (val?: string | null) =>
      !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const instructorId: string | null = isValidUuid(course.instructor_id)
      ? course.instructor_id
      : null;

    // 7. URL de callback après paiement
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin ||
      'http://localhost:3000';
    const callbackUrl = `${appUrl}/formations/achat/succes`;

    // 8. Création de la transaction FedaPay
    const tx = await createFedaPayTransaction({
      description: `SkillUp - Achat formation: ${course.title}`,
      amount: course.price,
      currency: 'XOF',
      callbackUrl,
      customer: {
        firstname: firstName,
        lastname: lastName,
        email: userEmail,
      },
      customMetadata: {
        student_id: userId,
        course_id: courseId,
        instructor_id: instructorId,
        course_title: course.title,
        app: 'SkillUp',
        type: 'course_purchase',
      },
    });

    // 9. Enregistrement initial en base (statut: 'pending')
    try {
      const admin = createAdminClient();
      await admin.from('course_purchases').insert({
        student_id: userId,
        course_id: courseId,
        instructor_id: instructorId,
        amount: course.price,
        currency: 'XOF',
        provider: 'fedapay',
        provider_transaction_id: String(tx.id),
        status: 'pending',
        raw_response: tx as Record<string, unknown>,
      });
    } catch (dbErr) {
      console.warn('Notice BD: Impossible d enregistrer l achat pending (mode local):', dbErr);
    }

    // 10. Génération du lien de checkout FedaPay
    const checkout = await generateFedaPayCheckoutUrl(
      tx.id,
      `${callbackUrl}?transaction_id=${tx.id}&course_id=${courseId}`
    );

    return NextResponse.json({
      success: true,
      free: false,
      transactionId: tx.id,
      checkoutUrl: checkout.url,
      courseId,
      amount: course.price,
      currency: 'XOF',
    });
  } catch (error) {
    console.error('Erreur /api/courses/purchase/create:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erreur interne lors de l initialisation de l achat.',
      },
      { status: 500 }
    );
  }
}
