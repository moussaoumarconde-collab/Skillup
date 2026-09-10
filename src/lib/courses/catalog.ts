/**
 * SKILLUP - SERVICE D'ACCÈS AU CATALOGUE DES FORMATIONS (SUPABASE)
 *
 * Ce service est la source de vérité pour le catalogue public de SkillUp.
 * Règles appliquées :
 * - Interroge directement les tables Supabase (public.courses, course_modules, course_lessons).
 * - Filtre strictement sur status = 'published' (respect strict de la sécurité RLS).
 * - Ne divulgue JAMAIS le contenu protégé des leçons (video_url, text_content).
 * - Pas de fallback automatique vers mockData (si 0 formation publiée, retourne []).
 * - Convertit les entités de base de données vers l'interface UI Course.
 */

import { Course, CourseLevel, CourseStatus, Module, Lesson } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

export interface RawDbLesson {
  id: string;
  title: string;
  duration: string;
  content_type: 'video' | 'text';
  sort_order: number;
}

export interface RawDbModule {
  id: string;
  title: string;
  sort_order: number;
  course_lessons?: RawDbLesson[];
}

export interface RawDbCourse {
  id: string;
  instructor_id: string;
  title: string;
  subtitle?: string | null;
  description: string;
  category: string;
  level: CourseLevel;
  status: 'draft' | 'published' | 'archived';
  pricing_type: 'free' | 'paid';
  price: number;
  thumbnail_url?: string | null;
  duration?: string | null;
  created_at: string;
  updated_at: string;
  course_modules?: RawDbModule[];
}

export interface InstructorPublicInfo {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
}

/**
 * Mappe une entité DbCourse issue de Supabase vers l'interface Course de l'UI
 */
export function mapDbCourseToUI(
  rawCourse: RawDbCourse,
  instructor?: InstructorPublicInfo | null
): Course {
  const status: CourseStatus =
    rawCourse.pricing_type === 'free' ? 'Gratuite' : 'Payante';

  const instructorName = instructor
    ? [instructor.first_name, instructor.last_name].filter(Boolean).join(' ') || 'Formateur SkillUp'
    : 'Formateur SkillUp';

  const instructorAvatar =
    instructor?.avatar_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  // Formatage des modules et leçons (uniquement les métadonnées publiques)
  const modules: Module[] = (rawCourse.course_modules || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((mod) => {
      const lessons: Lesson[] = (mod.course_lessons || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((les) => ({
          id: les.id,
          title: les.title,
          duration: les.duration || '10 min',
          order: les.sort_order,
          // videoUrl et text_content sont volontairement omis pour respecter la sécurité
        }));

      return {
        id: mod.id,
        title: mod.title,
        order: mod.sort_order,
        lessons,
      };
    });

  const totalLessonsCount = modules.reduce(
    (total, m) => total + (m.lessons ? m.lessons.length : 0),
    0
  );

  return {
    id: rawCourse.id,
    title: rawCourse.title,
    subtitle: rawCourse.subtitle || undefined,
    description: rawCourse.description || '',
    instructor: {
      name: instructorName,
      avatar: instructorAvatar,
      role: 'Formateur certifié',
    },
    thumbnail:
      rawCourse.thumbnail_url ||
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    thumbnailBgColor: 'bg-indigo-600',
    duration: rawCourse.duration || '0 min',
    lessonsCount: totalLessonsCount,
    modulesCount: modules.length,
    level: rawCourse.level,
    status,
    price: rawCourse.pricing_type === 'paid' ? rawCourse.price : 0,
    isPopular: false,
    likesCount: '0',
    downloadsCount: 0,
    rating: 5.0,
    category: rawCourse.category || 'Développement',
    featured: false,
    modules,
  };
}

// ==============================================================================
// CACHE MÉMOIRE ULTRA-RAPIDE (Stale-While-Revalidate) POUR CHARGEMENT INSTANTANÉ
// ==============================================================================
let _cachedPublishedCourses: Course[] | null = null;
let _cachedCoursesTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute de validité pour affichage en 0ms
const _courseDetailsCache = new Map<string, { course: Course; timestamp: number }>();

/**
 * Retourne immédiatement les formations en cache si disponibles (0ms de latence)
 */
export function getCachedPublishedCourses(): Course[] | null {
  return _cachedPublishedCourses;
}

/**
 * Invalide le cache lorsque des formations sont ajoutées ou modifiées
 */
export function invalidateCoursesCache(): void {
  _cachedPublishedCourses = null;
  _cachedCoursesTimestamp = 0;
  _courseDetailsCache.clear();
}

/**
 * Récupère la liste de toutes les formations publiées depuis Supabase
 * Règle : Retourne immédiatement les données en cache (0ms), puis rafraîchit en arrière-plan.
 * Ne renvoie AUCUNE donnée mockée si la base est vide.
 */
export async function fetchPublishedCourses(
  customClient?: SupabaseClient,
  forceRefresh = false
): Promise<Course[]> {
  const now = Date.now();
  if (!forceRefresh && _cachedPublishedCourses && (now - _cachedCoursesTimestamp < CACHE_TTL_MS)) {
    return _cachedPublishedCourses;
  }

  try {
    const supabase = customClient || createClient();

    // 1. Récupération des formations publiées avec leurs modules et leçons
    // Note de sécurité : on sélectionne uniquement les champs publics des leçons
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        instructor_id,
        title,
        subtitle,
        description,
        category,
        level,
        status,
        pricing_type,
        price,
        thumbnail_url,
        duration,
        created_at,
        updated_at,
        course_modules (
          id,
          title,
          sort_order,
          course_lessons (
            id,
            title,
            duration,
            content_type,
            sort_order
          )
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (coursesError) {
      console.error('[CatalogService] Erreur lors de la récupération des cours:', coursesError);
      return [];
    }

    if (!coursesData || coursesData.length === 0) {
      return [];
    }

    // 2. Récupération des profils publics des formateurs concernés
    const instructorIds = Array.from(
      new Set(
        coursesData
          .map((c: any) => c.instructor_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    let instructorsMap = new Map<string, InstructorPublicInfo>();

    if (instructorIds.length > 0) {
      const { data: instructorsData, error: instError } = await supabase
        .from('instructor_public_profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', instructorIds);

      if (!instError && instructorsData) {
        instructorsData.forEach((inst: any) => {
          instructorsMap.set(inst.id, inst);
        });
      }
    }

    // 3. Transformation en objets Course pour l'UI
    const mapped = coursesData.map((course: any) => {
      const instructor = instructorsMap.get(course.instructor_id) || null;
      return mapDbCourseToUI(course as RawDbCourse, instructor);
    });

    _cachedPublishedCourses = mapped;
    _cachedCoursesTimestamp = Date.now();
    return mapped;
  } catch (err) {
    console.error('[CatalogService] Exception fetchPublishedCourses:', err);
    return _cachedPublishedCourses || [];
  }
}

/**
 * Récupère une formation publiée par son identifiant unique (UUID)
 * Retourne null si la formation n'existe pas ou n'est pas publiée.
 */
export async function fetchPublishedCourseById(
  courseId: string,
  customClient?: SupabaseClient,
  forceRefresh = false
): Promise<Course | null> {
  if (!courseId) return null;

  const cached = _courseDetailsCache.get(courseId);
  const now = Date.now();
  if (!forceRefresh && cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.course;
  }

  // Vérifier également si disponible dans le cache catalogue global
  if (!forceRefresh && _cachedPublishedCourses) {
    const fromGlobal = _cachedPublishedCourses.find((c) => c.id === courseId);
    if (fromGlobal) {
      _courseDetailsCache.set(courseId, { course: fromGlobal, timestamp: now });
      return fromGlobal;
    }
  }

  try {
    const supabase = customClient || createClient();

    // 1. Récupération de la formation publiée ciblée
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select(`
        id,
        instructor_id,
        title,
        subtitle,
        description,
        category,
        level,
        status,
        pricing_type,
        price,
        thumbnail_url,
        duration,
        created_at,
        updated_at,
        course_modules (
          id,
          title,
          sort_order,
          course_lessons (
            id,
            title,
            duration,
            content_type,
            sort_order
          )
        )
      `)
      .eq('id', courseId)
      .eq('status', 'published')
      .maybeSingle();

    if (courseError || !courseData) {
      return null;
    }

    // 2. Récupération du profil public du formateur
    let instructor: InstructorPublicInfo | null = null;
    if (courseData.instructor_id) {
      const { data: instData } = await supabase
        .from('instructor_public_profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('id', courseData.instructor_id)
        .maybeSingle();

      if (instData) {
        instructor = instData;
      }
    }

    // 3. Transformation en objet Course
    const result = mapDbCourseToUI(courseData as RawDbCourse, instructor);
    _courseDetailsCache.set(courseId, { course: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.error('[CatalogService] Exception fetchPublishedCourseById:', err);
    return null;
  }
}
