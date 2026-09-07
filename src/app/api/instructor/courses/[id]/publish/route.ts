import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedInstructor,
  publishCourse,
  validateCourseForPublication,
} from '@/lib/courses/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/instructor/courses/[id]/publish
 * Prévisualise le rapport de validation avant publication
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  const { id } = await context.params;

  try {
    const validation = await validateCourseForPublication(id, instructor.userId);
    if (validation.statusCode === 404) {
      return NextResponse.json(
        { error: validation.errors[0] || 'Formation introuvable.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ validation });
  } catch (err) {
    console.error('[API Publish GET] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des conditions de publication.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instructor/courses/[id]/publish
 * Valide et publie officiellement la formation (status = 'published')
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  const { id } = await context.params;

  try {
    const result = await publishCourse(id, instructor.userId);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Conditions de publication non remplies.',
          errors: result.errors,
        },
        { status: result.statusCode || 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Formation publiée avec succès.',
      course: result.course,
    });
  } catch (err) {
    console.error('[API Publish POST] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la publication de la formation.' },
      { status: 500 }
    );
  }
}
