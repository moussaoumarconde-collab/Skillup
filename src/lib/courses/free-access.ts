/**
 * SKILLUP - SERVICE D'ACCÈS SÉCURISÉ AUX FORMATIONS GRATUITES (PHASE 9E)
 *
 * Règle 3 obligatoire :
 * - Une formation gratuite ne passe JAMAIS par FedaPay.
 * - L'accès est validé et accordé par cette logique serveur sécurisée.
 * - Une formation payante est formellement rejetée ici (doit passer par Phase 9D).
 * - L'accès accordé est enregistré de manière idempotente dans public.course_access.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { checkCourseAccess, grantCourseAccess } from '@/lib/courses/access';
import { DbCourse } from '@/types/course';

export interface FreeEnrollmentResult {
  success: boolean;
  error?: string;
  alreadyGranted?: boolean;
  message?: string;
}

/**
 * Enrôle un étudiant authentifié à une formation gratuite
 */
export async function enrollInFreeCourse(
  studentId: string,
  courseId: string
): Promise<FreeEnrollmentResult> {
  if (!studentId || !courseId) {
    return { success: false, error: 'Identifiants étudiant et cours requis.' };
  }

  const admin = createAdminClient();

  try {
    // 1. Vérifier si l'étudiant a déjà accès
    const hasAccess = await checkCourseAccess(studentId, courseId);
    if (hasAccess) {
      return {
        success: true,
        alreadyGranted: true,
        message: 'Vous avez déjà accès à cette formation.',
      };
    }

    // 2. Récupérer la formation côté serveur pour vérifier son statut et sa gratuité
    const { data: course, error: courseError } = await admin
      .from('courses')
      .select('id, title, status, pricing_type, price')
      .eq('id', courseId)
      .maybeSingle();

    if (courseError) {
      console.warn('[FreeEnrollment] Erreur lecture formation Supabase:', courseError);
    }

    if (!course) {
      return {
        success: false,
        error: 'Formation introuvable.',
      };
    }

    // 3. Contrôle de publication
    if (course.status !== 'published') {
      return {
        success: false,
        error: 'Cette formation n\'est pas encore disponible à l\'inscription.',
      };
    }

    // 4. Contrôle de gratuité STRICT
    if (course.pricing_type !== 'free' || (course.price && course.price > 0)) {
      return {
        success: false,
        error: 'Cette formation est payante. Veuillez passer par le système de paiement sécurisé.',
      };
    }

    // 5. Accorder l'accès officiel dans public.course_access (avec purchase_id = null)
    const result = await grantCourseAccess(studentId, courseId, null);

    if (!result.success) {
      return {
        success: false,
        error: 'Impossible d\'enregistrer l\'accès à la formation. Veuillez réessayer.',
      };
    }

    return {
      success: true,
      alreadyGranted: !!result.alreadyGranted,
      message: 'Inscription validée ! Vous pouvez maintenant suivre les leçons.',
    };
  } catch (err) {
    console.error('[FreeEnrollment] Erreur inattendue:', err);
    return {
      success: false,
      error: 'Une erreur serveur est survenue lors de l\'inscription gratuite.',
    };
  }
}
