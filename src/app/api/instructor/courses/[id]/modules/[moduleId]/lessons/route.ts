import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedInstructor, createLesson } from '@/lib/courses/server';

interface RouteContext {
  params: Promise<{ id: string; moduleId: string }>;
}

/**
 * POST /api/instructor/courses/[id]/modules/[moduleId]/lessons
 * Crée une nouvelle leçon dans un module
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  const { id, moduleId } = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const result = await createLesson(id, moduleId, instructor.userId, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ lesson: result.lesson }, { status: 201 });
  } catch (err) {
    console.error('[API Lessons POST] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la leçon.' },
      { status: 500 }
    );
  }
}
