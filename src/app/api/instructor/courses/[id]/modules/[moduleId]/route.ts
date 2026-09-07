import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedInstructor,
  updateModule,
  deleteModule,
} from '@/lib/courses/server';

interface RouteContext {
  params: Promise<{ id: string; moduleId: string }>;
}

/**
 * PUT /api/instructor/courses/[id]/modules/[moduleId]
 * Modifie le titre ou l'ordre d'un module
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  const { id, moduleId } = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const result = await updateModule(id, moduleId, instructor.userId, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ module: result.module });
  } catch (err) {
    console.error('[API Module PUT] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du module.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/instructor/courses/[id]/modules/[moduleId]
 * Supprime un module
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { instructor, errorResponse } = await getAuthenticatedInstructor(request);
  if (errorResponse || !instructor) return errorResponse;

  const { id, moduleId } = await context.params;

  try {
    const result = await deleteModule(id, moduleId, instructor.userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Module supprimé.' });
  } catch (err) {
    console.error('[API Module DELETE] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du module.' },
      { status: 500 }
    );
  }
}
