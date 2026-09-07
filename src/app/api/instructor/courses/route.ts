import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedInstructor,
  listInstructorCourses,
  createCourseDraft,
} from '@/lib/courses/server';

/**
 * GET /api/instructor/courses
 * Liste les formations du formateur connecté avec leurs métriques réelles
 */
export async function GET(request: NextRequest) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  try {
    const courses = await listInstructorCourses(instructor.userId);
    return NextResponse.json({ courses });
  } catch (err) {
    console.error('[API Courses GET] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des formations.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instructor/courses
 * Crée une nouvelle formation en statut brouillon ('draft')
 */
export async function POST(request: NextRequest) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  try {
    const body = await request.json().catch(() => ({}));
    const result = await createCourseDraft(instructor.userId, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ course: result.course }, { status: 201 });
  } catch (err) {
    console.error('[API Courses POST] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la formation.' },
      { status: 500 }
    );
  }
}
