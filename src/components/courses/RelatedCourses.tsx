'use client';

import React from 'react';
import { Course } from '@/types';
import { CourseCard } from '@/components/ui/CourseCard';
import { BookOpen } from 'lucide-react';

interface RelatedCoursesProps {
  currentCourseId: string;
  courses: Course[];
}

export const RelatedCourses: React.FC<RelatedCoursesProps> = ({
  currentCourseId,
  courses,
}) => {
  const otherCourses = courses.filter((c) => c.id !== currentCourseId);

  if (otherCourses.length === 0) return null;

  return (
    <section className="space-y-4 pt-2">
      <div className="flex items-center gap-2 px-1">
        <BookOpen className="w-5 h-5 text-[#5C4DF5]" />
        <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
          Autres formations recommandées
        </h2>
      </div>

      {/* Liste verticale de cartes rectangulaires (STRICTEMENT EN DESSOUS) */}
      <div className="space-y-3 sm:space-y-3.5">
        {otherCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            isHighlighted={false}
          />
        ))}
      </div>
    </section>
  );
};
