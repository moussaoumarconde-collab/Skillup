import React from 'react';
import { notFound } from 'next/navigation';
import { fetchPublishedCourseById, fetchPublishedCourses } from '@/lib/courses/catalog';
import { CourseDetailHero } from '@/components/courses/CourseDetailHero';
import { CourseCurriculum } from '@/components/courses/CourseCurriculum';
import { RelatedCourses } from '@/components/courses/RelatedCourses';

// Rendu dynamique à la demande pour garantir la disponibilité immédiate de toute formation publiée
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Récupération de la formation publiée ciblée depuis Supabase
  const course = await fetchPublishedCourseById(id);

  // Cas où la formation n'existe pas, est en brouillon/archivée, ou erreur : 404 strict
  if (!course) {
    notFound();
  }

  // Récupération des formations publiées réelles pour la section des recommandations
  const allPublishedCourses = await fetchPublishedCourses();

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 py-2 sm:py-4">
      {/* 1. EN-TÊTE DE LA FORMATION SÉLECTIONNÉE (HERO) */}
      <CourseDetailHero course={course} />

      {/* 2. PROGRAMME PÉDAGOGIQUE (CURRICULUM) */}
      <CourseCurriculum
        modules={course.modules}
        totalDuration={course.duration}
        totalLessons={course.lessonsCount}
      />

      {/* 3. AUTRES FORMATIONS (STRICTEMENT EN DESSOUS) */}
      <RelatedCourses
        currentCourseId={course.id}
        courses={allPublishedCourses}
      />
    </div>
  );
}
