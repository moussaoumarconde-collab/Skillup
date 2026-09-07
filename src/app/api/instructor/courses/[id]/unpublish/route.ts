import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedInstructor, unpublishCourse } from '@/lib/courses/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/instructor/courses/[id]/unpublish
 * Dépublie la formation (repasse en statut 'draft')
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  const { id } = await context.params;

  try {
    const result = await unpublishCourse(id, instructor.userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Formation dépubliée et replacée en brouillon.',
      course: result.course,
    });
  } catch (err) {
    console.error('[API Unpublish POST] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la dépublication de la formation.' },
      { status: 500 }
    );
  }
}
