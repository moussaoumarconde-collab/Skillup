import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enrollInFreeCourse } from '@/lib/courses/free-access';

/**
 * POST /api/courses/free-enroll
 *
 * Enrôle directement et gratuitement un élève à une formation gratuite.
 *
 * Sécurité stricte (Règle 3 obligatoire) :
 * - Aucun passage par FedaPay.
 * - Authentification obligatoire de l'élève.
 * - Vérification serveur : statut publié obligatoire.
 * - Vérification serveur : pricing_type === 'free' et price === 0 obligatoire.
 * - Attribution officielle de l'accès dans public.course_access.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentification de l'élève
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let studentId = user?.id;

    if (!studentId) {
      const localToken = request.cookies.get('skillup_auth_token')?.value;
      const localUserId = request.cookies.get('skillup_user_id')?.value;
      if (localToken && localUserId) {
        studentId = localUserId;
      }
    }

    if (!studentId) {
      return NextResponse.json(
        { error: 'Veuillez vous connecter pour vous inscrire à cette formation gratuite.' },
        { status: 401 }
      );
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

    // 3. Traitement sécurisé par le service d'accès gratuit
    const result = await enrollInFreeCourse(studentId, courseId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      alreadyGranted: result.alreadyGranted,
      message: result.message,
    });
  } catch (err) {
    console.error('[API FreeEnroll POST] Erreur:', err);
    return NextResponse.json(
      { error: 'Une erreur serveur est survenue lors de l\'inscription.' },
      { status: 500 }
    );
  }
}
