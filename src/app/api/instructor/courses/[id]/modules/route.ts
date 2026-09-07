import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedInstructor, createModule } from '@/lib/courses/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/instructor/courses/[id]/modules
 * Crée un module au sein d'une formation appartenant au formateur
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  const { id } = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const result = await createModule(id, instructor.userId, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ module: result.module }, { status: 201 });
  } catch (err) {
    console.error('[API Modules POST] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la création du module.' },
      { status: 500 }
    );
  }
}
