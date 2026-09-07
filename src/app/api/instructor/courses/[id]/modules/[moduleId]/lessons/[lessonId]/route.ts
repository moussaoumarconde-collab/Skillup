import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedInstructor,
  updateLesson,
  deleteLesson,
} from '@/lib/courses/server';

interface RouteContext {
  params: Promise<{ id: string; moduleId: string; lessonId: string }>;
}

/**
 * PUT /api/instructor/courses/[id]/modules/[moduleId]/lessons/[lessonId]
 * Modifie le contenu ou les métadonnées d'une leçon
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  const { id, moduleId, lessonId } = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const result = await updateLesson(id, moduleId, lessonId, instructor.userId, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ lesson: result.lesson });
  } catch (err) {
    console.error('[API Lesson PUT] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la leçon.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/instructor/courses/[id]/modules/[moduleId]/lessons/[lessonId]
 * Supprime une leçon
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  const { id, moduleId, lessonId } = await context.params;

  try {
    const result = await deleteLesson(id, moduleId, lessonId, instructor.userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Leçon supprimée.' });
  } catch (err) {
    console.error('[API Lesson DELETE] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la leçon.' },
      { status: 500 }
    );
  }
}
