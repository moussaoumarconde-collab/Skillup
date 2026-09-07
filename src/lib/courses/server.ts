/**
 * SKILLUP - SERVICE SERVEUR DE GESTION DU CONTENU FORMATEUR (PHASE 9E)
 *
 * Règles impératives implémentées :
 * - Supabase est la source de vérité pour le contenu et les métadonnées.
 * - Contrôle strict des rôles (formateur obligatoire, élève interdit).
 * - Contrôle strict de propriété (un formateur ne gère que ses propres formations).
 * - Règle anti-suppression : archivage obligatoire si la formation a déjà des acheteurs ou élèves.
 * - Règle de publication contrôlée : validation complète serveur (titre, desc, modules, leçons, prix, abonnement actif).
 * - Métriques réelles : ventes, élèves, revenus, statut (zéro téléchargements).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isInstructor, isAdmin } from '@/lib/auth/roles';
import { isSubscriptionActive } from '@/lib/subscriptions';
import {
  DbCourse,
  DbCourseModule,
  DbCourseLesson,
  CourseWithCurriculum,
  InstructorCourseMetrics,
  CreateCourseDTO,
  UpdateCourseDTO,
  CreateModuleDTO,
  UpdateModuleDTO,
  CreateLessonDTO,
  UpdateLessonDTO,
  CoursePublicationValidationResult,
} from '@/types/course';
import { InstructorSubscription } from '@/types';

// =============================================================================
// 1. AUTHENTIFICATION ET CONTRÔLE D'ACCÈS DU FORMATEUR
// =============================================================================

export interface AuthenticatedInstructor {
  userId: string;
  email: string;
  role: 'instructor' | 'admin';
}

/**
 * Extrait et vérifie formellement l'identité et le rôle du formateur
 */
export async function getAuthenticatedInstructor(
  request: NextRequest
): Promise<{ instructor?: AuthenticatedInstructor; errorResponse?: NextResponse }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    let userEmail = user?.email || '';
    let role: string | undefined = undefined;

    // Récupération de l'ID via session ou token de secours (développement local)
    if (!userId) {
      const localToken = request.cookies.get('skillup_auth_token')?.value;
      const localUserId = request.cookies.get('skillup_user_id')?.value;
      const localRole = request.cookies.get('skillup_role')?.value;

      if (localToken && localUserId) {
        userId = localUserId;
        userEmail = request.cookies.get('skillup_email')?.value || 'formateur@skillup.com';
        role = localRole;
      }
    }

    if (!userId) {
      return {
        errorResponse: NextResponse.json(
          { error: 'Authentification requise pour accéder à la gestion des formations.' },
          { status: 401 }
        ),
      };
    }

    // Vérifier le rôle dans la table profiles via client admin
    const admin = createAdminClient();
    if (!role) {
      const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      role = profile?.role || 'student';
    }

    // Interdiction formelle pour les élèves
    if (!isInstructor(role as any) && !isAdmin(role as any)) {
      return {
        errorResponse: NextResponse.json(
          { error: 'Accès refusé : espace réservé aux formateurs autorisés.' },
          { status: 403 }
        ),
      };
    }

    return {
      instructor: {
        userId,
        email: userEmail,
        role: role as 'instructor' | 'admin',
      },
    };
  } catch (err) {
    console.error('[AuthInstructor] Erreur lors de la vérification auth:', err);
    return {
      errorResponse: NextResponse.json(
        { error: 'Erreur interne lors de la vérification des permissions.' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Vérifie qu'une formation existe et appartient bien au formateur connecté
 */
export async function verifyCourseOwnership(
  courseId: string,
  instructorId: string
): Promise<{ course?: DbCourse; errorResponse?: NextResponse }> {
  const admin = createAdminClient();

  const { data: course, error } = await admin
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .maybeSingle();

  if (error || !course) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Formation introuvable.' },
        { status: 404 }
      ),
    };
  }

  if (course.instructor_id !== instructorId) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Accès interdit : vous n\'êtes pas le propriétaire de cette formation.' },
        { status: 403 }
      ),
    };
  }

  return { course: course as DbCourse };
}


// =============================================================================
// 2. GESTION DES FORMATIONS (CRUD & MÉTRIQUES)
// =============================================================================

/**
 * Liste les formations du formateur avec leurs métriques réelles (ventes, élèves, revenus)
 */
export async function listInstructorCourses(
  instructorId: string
): Promise<(DbCourse & { metrics: InstructorCourseMetrics })[]> {
  const admin = createAdminClient();

  // 1. Récupérer les formations du formateur
  const { data: courses, error } = await admin
    .from('courses')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false });

  if (error || !courses) {
    console.warn('[Courses] Erreur récupération formations formateur:', error);
    return [];
  }

  // 2. Pour chaque formation, calculer les métriques réelles
  const coursesWithMetrics = await Promise.all(
    courses.map(async (course: DbCourse) => {
      // Nombre d'élèves ayant accès
      const { count: studentsCount } = await admin
        .from('course_access')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);

      // Achats réussis et revenus
      const { data: purchases } = await admin
        .from('course_purchases')
        .select('amount')
        .eq('course_id', course.id)
        .eq('status', 'successful');

      const salesCount = purchases?.length || 0;
      const totalRevenue = (purchases || []).reduce((sum, p) => sum + (p.amount || 0), 0);

      const metrics: InstructorCourseMetrics = {
        course_id: course.id,
        status: course.status,
        pricing_type: course.pricing_type,
        price: course.price,
        sales_count: salesCount,
        students_count: studentsCount || 0,
        total_revenue: totalRevenue,
      };

      return {
        ...course,
        metrics,
      };
    })
  );

  return coursesWithMetrics;
}

/**
 * Récupère une formation avec l'intégralité de son programme (modules et leçons)
 */
export async function getCourseWithCurriculum(
  courseId: string,
  instructorId: string
): Promise<CourseWithCurriculum | null> {
  const admin = createAdminClient();

  const { course, errorResponse } = await verifyCourseOwnership(courseId, instructorId);
  if (errorResponse || !course) return null;

  // Récupérer les modules ordonnés
  const { data: modules } = await admin
    .from('course_modules')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true });

  // Récupérer les leçons ordonnées
  const { data: lessons } = await admin
    .from('course_lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true });

  // Assembler la hiérarchie modules -> leçons
  const curriculumModules = (modules || []).map((m: DbCourseModule) => {
    const moduleLessons = (lessons || []).filter((l: DbCourseLesson) => l.module_id === m.id);
    return {
      ...m,
      lessons: moduleLessons,
    };
  });

  // Métriques
  const { count: studentsCount } = await admin
    .from('course_access')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  const { data: purchases } = await admin
    .from('course_purchases')
    .select('amount')
    .eq('course_id', courseId)
    .eq('status', 'successful');

  const salesCount = purchases?.length || 0;
  const totalRevenue = (purchases || []).reduce((sum, p) => sum + (p.amount || 0), 0);

  return {
    ...course,
    modules: curriculumModules,
    metrics: {
      course_id: course.id,
      status: course.status,
      pricing_type: course.pricing_type,
      price: course.price,
      sales_count: salesCount,
      students_count: studentsCount || 0,
      total_revenue: totalRevenue,
    },
  };
}

/**
 * Crée un nouveau brouillon de formation (status = 'draft')
 */
export async function createCourseDraft(
  instructorId: string,
  dto: CreateCourseDTO
): Promise<{ course?: DbCourse; error?: string }> {
  if (!dto.title || dto.title.trim().length < 3) {
    return { error: 'Le titre de la formation doit contenir au moins 3 caractères.' };
  }

  const admin = createAdminClient();

  const pricingType = dto.pricing_type || 'free';
  const price = pricingType === 'free' ? 0 : Math.max(0, dto.price || 0);

  const newCourse = {
    instructor_id: instructorId,
    title: dto.title.trim(),
    subtitle: dto.subtitle?.trim() || null,
    description: dto.description?.trim() || '',
    category: dto.category?.trim() || 'Développement',
    level: dto.level || 'Débutant',
    status: 'draft',
    pricing_type: pricingType,
    price: price,
    thumbnail_url: dto.thumbnail_url?.trim() || null,
    duration: dto.duration?.trim() || '0 min',
  };

  const { data, error } = await admin
    .from('courses')
    .insert(newCourse)
    .select()
    .single();

  if (error) {
    console.error('[Courses] Erreur création brouillon:', error);
    return { error: 'Erreur lors de la création du brouillon en base de données.' };
  }

  return { course: data as DbCourse };
}

/**
 * Met à jour les informations générales d'une formation
 */
export async function updateCourse(
  courseId: string,
  instructorId: string,
  dto: UpdateCourseDTO
): Promise<{ course?: DbCourse; error?: string }> {
  const admin = createAdminClient();

  const updatePayload: Partial<DbCourse> = {};

  if (dto.title !== undefined) {
    if (dto.title.trim().length < 3) {
      return { error: 'Le titre doit contenir au moins 3 caractères.' };
    }
    updatePayload.title = dto.title.trim();
  }

  if (dto.subtitle !== undefined) updatePayload.subtitle = dto.subtitle?.trim() || null;
  if (dto.description !== undefined) updatePayload.description = dto.description.trim();
  if (dto.category !== undefined) updatePayload.category = dto.category.trim();
  if (dto.level !== undefined) updatePayload.level = dto.level;

  if (dto.pricing_type !== undefined) {
    updatePayload.pricing_type = dto.pricing_type;
    if (dto.pricing_type === 'free') {
      updatePayload.price = 0;
    } else if (dto.price !== undefined) {
      updatePayload.price = Math.max(0, dto.price);
    }
  } else if (dto.price !== undefined) {
    updatePayload.price = Math.max(0, dto.price);
  }

  if (dto.thumbnail_url !== undefined) updatePayload.thumbnail_url = dto.thumbnail_url?.trim() || null;
  if (dto.duration !== undefined) updatePayload.duration = dto.duration.trim();

  const { data, error } = await admin
    .from('courses')
    .update(updatePayload)
    .eq('id', courseId)
    .eq('instructor_id', instructorId)
    .select()
    .single();

  if (error) {
    console.error('[Courses] Erreur mise à jour formation:', error);
    return { error: 'Impossible de mettre à jour la formation.' };
  }

  return { course: data as DbCourse };
}

/**
 * Suppression sécurisée : archive la formation si elle possède des acheteurs ou élèves,
 * sinon procède à la suppression physique (DELETE).
 */
export async function archiveOrDeleteCourse(
  courseId: string,
  instructorId: string
): Promise<{ action: 'archived' | 'deleted'; message: string; error?: string }> {
  const admin = createAdminClient();

  // 1. Vérifier si des achats ou des accès existent
  const { data: purchases } = await admin
    .from('course_purchases')
    .select('id')
    .eq('course_id', courseId)
    .eq('status', 'successful')
    .limit(1);

  const { data: access } = await admin
    .from('course_access')
    .select('id')
    .eq('course_id', courseId)
    .limit(1);

  const hasBuyersOrStudents = (purchases && purchases.length > 0) || (access && access.length > 0);

  if (hasBuyersOrStudents) {
    // RÈGLE 5 OBLIGATOIRE : Archivage au lieu de suppression destructive
    const { error: archiveError } = await admin
      .from('courses')
      .update({ status: 'archived' })
      .eq('id', courseId)
      .eq('instructor_id', instructorId);

    if (archiveError) {
      console.error('[Courses] Erreur archivage:', archiveError);
      return { action: 'archived', error: 'Erreur lors de l\'archivage de la formation.', message: '' };
    }

    return {
      action: 'archived',
      message: 'Cette formation possède déjà des élèves inscrits. Elle a été archivée pour préserver leur accès.',
    };
  }

  // 2. Si aucun élève ni acheteur, suppression physique autorisée
  const { error: deleteError } = await admin
    .from('courses')
    .delete()
    .eq('id', courseId)
    .eq('instructor_id', instructorId);

  if (deleteError) {
    console.error('[Courses] Erreur suppression physique:', deleteError);
    return { action: 'deleted', error: 'Impossible de supprimer la formation.', message: '' };
  }

  return {
    action: 'deleted',
    message: 'Formation supprimée avec succès.',
  };
}


// =============================================================================
// 3. CONTRÔLE DE PUBLICATION CÔTÉ SERVEUR (RÈGLE 6)
// =============================================================================

/**
 * Valide si une formation respecte tous les prérequis pour la publication
 */
export async function validateCourseForPublication(
  courseId: string,
  instructorId: string
): Promise<CoursePublicationValidationResult> {
  const admin = createAdminClient();
  const errors: string[] = [];

  // 1. Charger la formation
  const { data: course } = await admin
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('instructor_id', instructorId)
    .maybeSingle();

  if (!course) {
    return {
      canPublish: false,
      statusCode: 404,
      errors: ['Formation introuvable ou accès non autorisé.'],
      checks: {
        hasTitle: false,
        hasDescription: false,
        hasCategory: false,
        hasValidPrice: false,
        hasActiveSubscription: false,
        hasModules: false,
        hasLessons: false,
        hasAllModulesWithLessons: false,
        hasAllLessonsWithContent: false,
        isStatusPublishable: false,
        modulesCount: 0,
        lessonsCount: 0,
      },
    };
  }

  // 2. Vérification des transitions de statut (P1)
  let isStatusPublishable = true;
  if (course.status === 'archived') {
    errors.push('Une formation archivée ne peut pas être publiée.');
    isStatusPublishable = false;
  } else if (course.status === 'published') {
    errors.push('Cette formation est déjà publiée.');
    isStatusPublishable = false;
  }

  // 3. Vérification des champs informatifs
  const hasTitle = Boolean(course.title && course.title.trim().length >= 3);
  if (!hasTitle) errors.push('Le titre doit comporter au moins 3 caractères.');

  const hasDescription = Boolean(course.description && course.description.trim().length >= 10);
  if (!hasDescription) errors.push('La description doit comporter au moins 10 caractères.');

  const hasCategory = Boolean(course.category && course.category.trim().length > 0);
  if (!hasCategory) errors.push('Veuillez renseigner une catégorie.');

  // 4. Vérification de la cohérence tarifaire
  const hasValidPrice =
    (course.pricing_type === 'free' && course.price === 0) ||
    (course.pricing_type === 'paid' && course.price > 0);
  if (!hasValidPrice) {
    if (course.pricing_type === 'paid' && course.price <= 0) {
      errors.push('Une formation payante doit avoir un prix strictement supérieur à 0 XOF.');
    } else if (course.pricing_type === 'free' && course.price !== 0) {
      errors.push('Une formation gratuite doit avoir un prix égal à 0 XOF.');
    }
  }

  // 5. Vérification de l'abonnement actif du formateur
  const { data: sub } = await admin
    .from('instructor_subscriptions')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasActiveSubscription = isSubscriptionActive(sub as InstructorSubscription);
  if (!hasActiveSubscription) {
    errors.push('Un abonnement formateur actif est requis pour publier une formation.');
  }

  // 6. Vérification approfondie des modules et leçons (P3)
  const { data: modules } = await admin
    .from('course_modules')
    .select('id, title')
    .eq('course_id', courseId);

  const modulesCount = modules?.length || 0;
  const hasModules = modulesCount >= 1;
  if (!hasModules) {
    errors.push('La formation doit contenir au moins 1 module.');
  }

  const { data: lessons } = await admin
    .from('course_lessons')
    .select('id, module_id, title, content_type, video_url, text_content')
    .eq('course_id', courseId);

  const lessonsCount = lessons?.length || 0;
  const hasLessons = lessonsCount >= 1;
  if (!hasLessons) {
    errors.push('La formation doit contenir au moins 1 leçon.');
  }

  // A. Vérifier qu'aucun module n'est vide
  let hasAllModulesWithLessons = true;
  if (modules && modules.length > 0) {
    const moduleIdsWithLessons = new Set((lessons || []).map((l) => l.module_id));
    const emptyModules = modules.filter((m) => !moduleIdsWithLessons.has(m.id));
    if (emptyModules.length > 0) {
      hasAllModulesWithLessons = false;
      const titles = emptyModules.map((m) => `"${m.title}"`).join(', ');
      errors.push(`Tous les modules doivent contenir au moins une leçon (module(s) vide(s) : ${titles}).`);
    }
  } else {
    hasAllModulesWithLessons = false;
  }

  // B. Vérifier que chaque leçon a un contenu réel (vidéo ou texte)
  let hasAllLessonsWithContent = true;
  if (lessons && lessons.length > 0) {
    const emptyLessons = lessons.filter((l) => {
      if (l.content_type === 'video') {
        return !l.video_url || l.video_url.trim().length === 0;
      }
      if (l.content_type === 'text') {
        return !l.text_content || l.text_content.trim().length === 0;
      }
      return true;
    });

    if (emptyLessons.length > 0) {
      hasAllLessonsWithContent = false;
      const titles = emptyLessons.map((l) => `"${l.title}"`).join(', ');
      errors.push(`Toutes les leçons doivent comporter du contenu pédagogique (leçon(s) vide(s) : ${titles}).`);
    }
  } else {
    hasAllLessonsWithContent = false;
  }

  // Condition globale de publication
  const canPublish =
    isStatusPublishable &&
    hasTitle &&
    hasDescription &&
    hasCategory &&
    hasValidPrice &&
    hasActiveSubscription &&
    hasModules &&
    hasLessons &&
    hasAllModulesWithLessons &&
    hasAllLessonsWithContent;

  let statusCode = 200;
  if (!canPublish) {
    if (!isStatusPublishable) {
      statusCode = 409; // Conflit de statut (déjà publiée ou archivée)
    } else {
      statusCode = 422; // Entité non traitable (conditions pédagogiques non remplies)
    }
  }

  return {
    canPublish,
    errors,
    statusCode,
    checks: {
      hasTitle,
      hasDescription,
      hasCategory,
      hasValidPrice,
      hasActiveSubscription,
      hasModules,
      hasLessons,
      hasAllModulesWithLessons,
      hasAllLessonsWithContent,
      isStatusPublishable,
      modulesCount,
      lessonsCount,
    },
  };
}

/**
 * Publie une formation après validation serveur
 */
export async function publishCourse(
  courseId: string,
  instructorId: string
): Promise<{ success: boolean; errors?: string[]; statusCode?: number; course?: DbCourse }> {
  const validation = await validateCourseForPublication(courseId, instructorId);

  if (!validation.canPublish) {
    return {
      success: false,
      errors: validation.errors,
      statusCode: validation.statusCode || 422,
    };
  }

  const admin = createAdminClient();

  // Verrou atomique : passage à 'published' UNIQUEMENT si la formation est actuellement en statut 'draft'
  const { data, error } = await admin
    .from('courses')
    .update({ status: 'published' })
    .eq('id', courseId)
    .eq('instructor_id', instructorId)
    .eq('status', 'draft')
    .select()
    .single();

  if (error || !data) {
    console.error('[Courses] Erreur publication:', error);
    return {
      success: false,
      errors: ['Erreur base de données ou état incompatible lors de la publication.'],
      statusCode: 500,
    };
  }

  return { success: true, course: data as DbCourse, statusCode: 200 };
}

/**
 * Dépublie une formation (remise en statut 'draft')
 */
export async function unpublishCourse(
  courseId: string,
  instructorId: string
): Promise<{ success: boolean; course?: DbCourse; error?: string; statusCode?: number }> {
  const admin = createAdminClient();

  // 1. Vérifier l'état actuel de la formation
  const { data: course, error: fetchError } = await admin
    .from('courses')
    .select('id, status')
    .eq('id', courseId)
    .eq('instructor_id', instructorId)
    .maybeSingle();

  if (fetchError || !course) {
    return { success: false, error: 'Formation introuvable ou accès non autorisé.', statusCode: 404 };
  }

  // 2. Verrous sur les statuts interdits
  if (course.status === 'archived') {
    return {
      success: false,
      error: 'Une formation archivée ne peut pas être dépubliée en brouillon.',
      statusCode: 409,
    };
  }

  if (course.status === 'draft') {
    return {
      success: false,
      error: 'Cette formation est déjà en statut brouillon.',
      statusCode: 409,
    };
  }

  // 3. Dépublication atomique (uniquement si 'published')
  const { data, error } = await admin
    .from('courses')
    .update({ status: 'draft' })
    .eq('id', courseId)
    .eq('instructor_id', instructorId)
    .eq('status', 'published')
    .select()
    .single();

  if (error || !data) {
    console.error('[Courses] Erreur dépublication:', error);
    return { success: false, error: 'Impossible de repasser la formation en brouillon.', statusCode: 500 };
  }

  return { success: true, course: data as DbCourse, statusCode: 200 };
}


// =============================================================================
// 4. GESTION DES MODULES
// =============================================================================

export async function createModule(
  courseId: string,
  instructorId: string,
  dto: CreateModuleDTO
): Promise<{ module?: DbCourseModule; error?: string }> {
  const { errorResponse } = await verifyCourseOwnership(courseId, instructorId);
  if (errorResponse) return { error: 'Accès non autorisé à cette formation.' };

  if (!dto.title || dto.title.trim().length === 0) {
    return { error: 'Le titre du module est requis.' };
  }

  const admin = createAdminClient();

  // Déterminer l'ordre si non spécifié
  let order = dto.sort_order;
  if (!order) {
    const { count } = await admin
      .from('course_modules')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);
    order = (count || 0) + 1;
  }

  const { data, error } = await admin
    .from('course_modules')
    .insert({
      course_id: courseId,
      title: dto.title.trim(),
      sort_order: order,
    })
    .select()
    .single();

  if (error) {
    console.error('[Modules] Erreur insertion module:', error);
    return { error: 'Erreur lors de la création du module.' };
  }

  return { module: data as DbCourseModule };
}

export async function updateModule(
  courseId: string,
  moduleId: string,
  instructorId: string,
  dto: UpdateModuleDTO
): Promise<{ module?: DbCourseModule; error?: string }> {
  const { errorResponse } = await verifyCourseOwnership(courseId, instructorId);
  if (errorResponse) return { error: 'Accès non autorisé à cette formation.' };

  const admin = createAdminClient();
  const updatePayload: Partial<DbCourseModule> = {};

  if (dto.title !== undefined) {
    if (dto.title.trim().length === 0) return { error: 'Le titre ne peut pas être vide.' };
    updatePayload.title = dto.title.trim();
  }
  if (dto.sort_order !== undefined) updatePayload.sort_order = Math.max(1, dto.sort_order);

  const { data, error } = await admin
    .from('course_modules')
    .update(updatePayload)
    .eq('id', moduleId)
    .eq('course_id', courseId)
    .select()
    .single();

  if (error) {
    console.error('[Modules] Erreur mise à jour module:', error);
    return { error: 'Impossible de modifier le module.' };
  }

  return { module: data as DbCourseModule };
}

export async function deleteModule(
  courseId: string,
  moduleId: string,
  instructorId: string
): Promise<{ success: boolean; error?: string }> {
  const { errorResponse } = await verifyCourseOwnership(courseId, instructorId);
  if (errorResponse) return { success: false, error: 'Accès non autorisé.' };

  const admin = createAdminClient();
  const { error } = await admin
    .from('course_modules')
    .delete()
    .eq('id', moduleId)
    .eq('course_id', courseId);

  if (error) {
    console.error('[Modules] Erreur suppression module:', error);
    return { success: false, error: 'Impossible de supprimer le module.' };
  }

  return { success: true };
}


// =============================================================================
// 5. GESTION DES LEÇONS
// =============================================================================

export async function createLesson(
  courseId: string,
  moduleId: string,
  instructorId: string,
  dto: CreateLessonDTO
): Promise<{ lesson?: DbCourseLesson; error?: string }> {
  const { errorResponse } = await verifyCourseOwnership(courseId, instructorId);
  if (errorResponse) return { error: 'Accès non autorisé à cette formation.' };

  if (!dto.title || dto.title.trim().length === 0) {
    return { error: 'Le titre de la leçon est obligatoire.' };
  }

  const admin = createAdminClient();

  // Déterminer l'ordre dans le module si non spécifié
  let order = dto.sort_order;
  if (!order) {
    const { count } = await admin
      .from('course_lessons')
      .select('*', { count: 'exact', head: true })
      .eq('module_id', moduleId);
    order = (count || 0) + 1;
  }

  const { data, error } = await admin
    .from('course_lessons')
    .insert({
      course_id: courseId,
      module_id: moduleId,
      title: dto.title.trim(),
      duration: dto.duration?.trim() || '10 min',
      content_type: dto.content_type || 'video',
      video_url: dto.video_url?.trim() || null,
      text_content: dto.text_content || null,
      sort_order: order,
    })
    .select()
    .single();

  if (error) {
    console.error('[Lessons] Erreur insertion leçon:', error);
    return { error: 'Erreur lors de la création de la leçon.' };
  }

  return { lesson: data as DbCourseLesson };
}

export async function updateLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  instructorId: string,
  dto: UpdateLessonDTO
): Promise<{ lesson?: DbCourseLesson; error?: string }> {
  const { errorResponse } = await verifyCourseOwnership(courseId, instructorId);
  if (errorResponse) return { error: 'Accès non autorisé à cette formation.' };

  const admin = createAdminClient();
  const updatePayload: Partial<DbCourseLesson> = {};

  if (dto.title !== undefined) {
    if (dto.title.trim().length === 0) return { error: 'Le titre ne peut pas être vide.' };
    updatePayload.title = dto.title.trim();
  }
  if (dto.duration !== undefined) updatePayload.duration = dto.duration.trim();
  if (dto.content_type !== undefined) updatePayload.content_type = dto.content_type;
  if (dto.video_url !== undefined) updatePayload.video_url = dto.video_url?.trim() || null;
  if (dto.text_content !== undefined) updatePayload.text_content = dto.text_content;
  if (dto.sort_order !== undefined) updatePayload.sort_order = Math.max(1, dto.sort_order);

  const { data, error } = await admin
    .from('course_lessons')
    .update(updatePayload)
    .eq('id', lessonId)
    .eq('module_id', moduleId)
    .eq('course_id', courseId)
    .select()
    .single();

  if (error) {
    console.error('[Lessons] Erreur mise à jour leçon:', error);
    return { error: 'Impossible de mettre à jour la leçon.' };
  }

  return { lesson: data as DbCourseLesson };
}

export async function deleteLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  instructorId: string
): Promise<{ success: boolean; error?: string }> {
  const { errorResponse } = await verifyCourseOwnership(courseId, instructorId);
  if (errorResponse) return { success: false, error: 'Accès non autorisé.' };

  const admin = createAdminClient();
  const { error } = await admin
    .from('course_lessons')
    .delete()
    .eq('id', lessonId)
    .eq('module_id', moduleId)
    .eq('course_id', courseId);

  if (error) {
    console.error('[Lessons] Erreur suppression leçon:', error);
    return { success: false, error: 'Impossible de supprimer la leçon.' };
  }

  return { success: true };
}
