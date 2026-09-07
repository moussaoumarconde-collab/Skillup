import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedInstructor,
  getCourseWithCurriculum,
  updateCourse,
  archiveOrDeleteCourse,
} from '@/lib/courses/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/instructor/courses/[id]
 * Récupère une formation avec son programme complet (modules + leçons ordonnés)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  const { id } = await context.params;

  try {
    const course = await getCourseWithCurriculum(id, instructor.userId);
    if (!course) {
      return NextResponse.json({ error: 'Formation introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (err) {
    console.error('[API Course GET [id]] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de la formation.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/instructor/courses/[id]
 * Modifie les informations d'une formation appartenant au formateur
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  const { id } = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const result = await updateCourse(id, instructor.userId, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ course: result.course });
  } catch (err) {
    console.error('[API Course PUT [id]] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la formation.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/instructor/courses/[id]
 * Supprime la formation ou l'archive si elle possède des acheteurs/élèves
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  const { id } = await context.params;

  try {
    const result = await archiveOrDeleteCourse(id, instructor.userId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[API Course DELETE [id]] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression/archivage de la formation.' },
      { status: 500 }
    );
  }
}
