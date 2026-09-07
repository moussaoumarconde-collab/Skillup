/**
 * SKILLUP - SERVICE D'ACCÈS AUX FORMATIONS (PHASE 9D)
 *
 * Ce module gère la vérification et l'attribution des accès aux formations.
 * Toutes les opérations d'écriture passent par le client admin (service_role).
 *
 * Règle absolue :
 * - Un élève n'obtient l'accès qu'après confirmation de paiement côté serveur.
 * - Les formations gratuites accordent l'accès immédiatement sans transaction FedaPay.
 * - Aucun accès n'est accordé côté client.
 */

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Vérifie si un élève a déjà accès à une formation
 */
export async function checkCourseAccess(
  studentId: string,
  courseId: string
): Promise<boolean> {
  const admin = createAdminClient();

  try {
    const { data } = await admin
      .from('course_access')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .maybeSingle();

    return !!data;
  } catch (err) {
    console.warn('[CourseAccess] Erreur vérification accès (mode local):', err);
    return false;
  }
}

/**
 * Accorde l'accès à une formation après paiement confirmé
 * Idempotent : ne crée pas de doublon grâce à la contrainte UNIQUE(student_id, course_id)
 */
export async function grantCourseAccess(
  studentId: string,
  courseId: string,
  purchaseId?: string | null
): Promise<{ success: boolean; alreadyGranted?: boolean }> {
  const admin = createAdminClient();

  try {
    // Vérifier si l'accès existe déjà (idempotence)
    const existing = await checkCourseAccess(studentId, courseId);
    if (existing) {
      return { success: true, alreadyGranted: true };
    }

    const { error } = await admin.from('course_access').insert({
      student_id: studentId,
      course_id: courseId,
      purchase_id: purchaseId || null,
      granted_at: new Date().toISOString(),
    });

    if (error) {
      // Contrainte UNIQUE violée = déjà accordé (race condition safe)
      if (error.code === '23505') {
        return { success: true, alreadyGranted: true };
      }
      console.error('[CourseAccess] Erreur insertion accès:', error);
      return { success: false };
    }

    return { success: true, alreadyGranted: false };
  } catch (err) {
    console.warn('[CourseAccess] Erreur grant access (mode local):', err);
    return { success: false };
  }
}
