/**
 * SKILLUP - TYPES POUR LA GESTION DU CONTENU FORMATEUR (PHASE 9E)
 *
 * Types TypeScript stricts alignés sur la migration 07_instructor_courses_and_curriculum.sql :
 * - Tables : courses, course_modules, course_lessons
 * - Rôles, intégrité, contrôle de publication et métriques
 */

export type CoursePublicationStatus = 'draft' | 'published' | 'archived';
export type CoursePricingType = 'free' | 'paid';
export type CourseContentLevel = 'Débutant' | 'Intermédiaire' | 'Avancé';
export type LessonContentType = 'video' | 'text';

/**
 * Entité Formation en base de données (public.courses)
 */
export interface DbCourse {
  id: string;
  instructor_id: string;
  title: string;
  subtitle?: string | null;
  description: string;
  category: string;
  level: CourseContentLevel;
  status: CoursePublicationStatus;
  pricing_type: CoursePricingType;
  price: number; // en XOF
  thumbnail_url?: string | null;
  duration?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Entité Module en base de données (public.course_modules)
 */
export interface DbCourseModule {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  lessons?: DbCourseLesson[];
}

/**
 * Entité Leçon en base de données (public.course_lessons)
 */
export interface DbCourseLesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  duration: string;
  content_type: LessonContentType;
  video_url?: string | null;
  text_content?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Formation avec son programme complet (modules ordonnés et leçons associées)
 */
export interface CourseWithCurriculum extends DbCourse {
  modules: (DbCourseModule & {
    lessons: DbCourseLesson[];
  })[];
  metrics?: InstructorCourseMetrics;
}

/**
 * Métriques réelles d'une formation pour l'espace formateur
 * Note : conformité stricte avec la règle 2 (pas de téléchargements en V1)
 */
export interface InstructorCourseMetrics {
  course_id: string;
  status: CoursePublicationStatus;
  pricing_type: CoursePricingType;
  price: number;
  sales_count: number;
  students_count: number;
  total_revenue: number; // 100% au formateur (règle financière Phase 9D)
}

/**
 * DTO de création d'une formation en brouillon
 */
export interface CreateCourseDTO {
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  level?: CourseContentLevel;
  pricing_type?: CoursePricingType;
  price?: number;
  thumbnail_url?: string;
  duration?: string;
}

/**
 * DTO de mise à jour d'une formation
 */
export interface UpdateCourseDTO {
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  level?: CourseContentLevel;
  pricing_type?: CoursePricingType;
  price?: number;
  thumbnail_url?: string;
  duration?: string;
}

/**
 * DTO Module
 */
export interface CreateModuleDTO {
  title: string;
  sort_order?: number;
}

export interface UpdateModuleDTO {
  title?: string;
  sort_order?: number;
}

/**
 * DTO Leçon
 */
export interface CreateLessonDTO {
  title: string;
  duration?: string;
  content_type?: LessonContentType;
  video_url?: string;
  text_content?: string;
  sort_order?: number;
}

export interface UpdateLessonDTO {
  title?: string;
  duration?: string;
  content_type?: LessonContentType;
  video_url?: string;
  text_content?: string;
  sort_order?: number;
}

/**
 * Résultat du contrôle de publication côté serveur
 */
export interface CoursePublicationValidationResult {
  canPublish: boolean;
  errors: string[];
  statusCode?: number;
  checks: {
    hasTitle: boolean;
    hasDescription: boolean;
    hasCategory: boolean;
    hasValidPrice: boolean;
    hasActiveSubscription: boolean;
    hasModules: boolean;
    hasLessons: boolean;
    hasAllModulesWithLessons: boolean;
    hasAllLessonsWithContent: boolean;
    isStatusPublishable: boolean;
    modulesCount: number;
    lessonsCount: number;
  };
}
