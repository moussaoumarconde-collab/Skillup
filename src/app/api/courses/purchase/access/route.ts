import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkCourseAccess } from '@/lib/courses/access';

/**
 * GET /api/courses/purchase/access?course_id=...
 *
 * Vérifie si l'utilisateur actuellement connecté a accès à une formation.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Identifiant de formation manquant' },
        { status: 400 }
      );
    }

    // Récupération de la formation depuis Supabase
    const admin = createAdminClient();
    const { data: course } = await admin
      .from('courses')
      .select('id, status, pricing_type, price')
      .eq('id', courseId)
      .maybeSingle();

    if (!course || course.status !== 'published') {
      return NextResponse.json({ hasAccess: false, isFree: false });
    }

    // Formation gratuite : toujours accessible
    const isFree = course.pricing_type === 'free' || !course.price || course.price === 0;
    if (isFree) {
      return NextResponse.json({ hasAccess: true, isFree: true });
    }

    // Authentification
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    if (!userId) {
      const hasLocalToken = request.cookies.get('skillup_auth_token')?.value;
      if (!hasLocalToken) {
        return NextResponse.json({ hasAccess: false, isFree: false });
      }
      userId = request.cookies.get('skillup_user_id')?.value;
    }

    if (!userId) {
      return NextResponse.json({ hasAccess: false, isFree: false });
    }

    const hasAccess = await checkCourseAccess(userId, courseId);
    return NextResponse.json({ hasAccess, isFree: false });
  } catch (error) {
    console.error('Erreur vérification accès formation:', error);
    return NextResponse.json({ hasAccess: false, isFree: false });
  }
}
