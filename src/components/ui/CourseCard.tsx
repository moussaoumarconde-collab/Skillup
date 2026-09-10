'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Clock, Play, BarChart2, ChevronRight, Download, Sparkles } from 'lucide-react';
import { Course } from '@/types';
import { Badge } from './Badge';

interface CourseCardProps {
  course: Course;
  onDownload?: (courseId: string) => void;
  onClick?: (courseId: string) => void;
  className?: string;
  isHighlighted?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onDownload,
  onClick,
  className = '',
  isHighlighted = false,
}) => {
  const router = useRouter();

  // Précharger immédiatement la page détaillée du cours en arrière-plan pour navigation instantanée en 1 clic
  useEffect(() => {
    if (course?.id) {
      router.prefetch(`/formations/${course.id}`);
    }
  }, [course?.id, router]);

  const handleCardClick = () => {
    if (onClick) {
      onClick(course.id);
    } else {
      router.push(`/formations/${course.id}`);
    }
  };

  const statusLabel =
    course.status === 'Gratuite'
      ? 'Gratuite'
      : course.price
      ? `Payante • ${course.price.toLocaleString('fr-FR')} FCFA`
      : 'Payante';

  // If highlighted: dominant, larger rectangular format, prominent hierarchy
  if (isHighlighted) {
    return (
      <div
        onClick={handleCardClick}
        className={`group bg-white rounded-2xl sm:rounded-3xl border-2 border-[#5C4DF5]/30 hover:border-[#5C4DF5]/50 ring-4 ring-[#5C4DF5]/5 p-4 sm:p-6 transition-all duration-300 shadow-lg shadow-indigo-100/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 relative overflow-hidden ${className}`}
      >
        {/* Rectangular Course Thumbnail (Larger, strictly rectangular) */}
        <div className="relative w-full sm:w-64 md:w-72 h-44 sm:h-44 md:h-48 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 320px"
              priority
            />
          ) : (
            <div
              className={`w-full h-full ${
                course.thumbnailBgColor || 'bg-indigo-600'
              } flex items-center justify-center text-white font-bold text-xl`}
            >
              {course.title.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Highlighted Course Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            {/* Top Badges row with Selection indicator */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-[#EDE9FE] text-[#5C4DF5] text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Formation sélectionnée
              </span>
              {course.isPopular && (
                <Badge variant="popular" className="text-xs px-2.5 py-0.5">
                  Populaire
                </Badge>
              )}
              <Badge
                variant={course.status === 'Gratuite' ? 'free' : 'paid'}
                className="text-xs px-2.5 py-0.5"
              >
                {statusLabel}
              </Badge>
            </div>

            {/* Dominant Title */}
            <h3 className="font-extrabold text-gray-900 text-lg sm:text-xl md:text-2xl group-hover:text-[#5C4DF5] transition-colors leading-tight">
              {course.title}
            </h3>

            {/* Subtitle / Instructor if available */}
            {course.subtitle && (
              <p className="text-xs sm:text-sm font-medium text-[#5C4DF5] mt-0.5">
                {course.subtitle}
              </p>
            )}

            {/* Extended Description */}
            <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Footer Metadata & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 sm:pt-4 mt-2 border-t border-gray-100">
            {/* Metadata Row */}
            <div className="flex items-center gap-3.5 sm:gap-5 text-xs sm:text-sm text-gray-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#5C4DF5]" />
                <span>{course.duration}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Play className="w-4 h-4 text-[#5C4DF5]" />
                <span>{course.lessonsCount} leçons</span>
              </div>

              <div className="flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#5C4DF5]" />
                <span>{course.level}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDownload) onDownload(course.id);
                }}
                className="w-full sm:w-auto bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 sm:py-3 rounded-xl transition-all shadow-md shadow-indigo-200/50 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger</span>
                <ChevronRight className="w-4 h-4 hidden sm:inline-block" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal compact rectangular layout for following courses or direct browsing
  return (
    <div
      onClick={handleCardClick}
      className={`group bg-white rounded-2xl border border-[#F0F2F6] hover:border-[#E2E8F0] p-3 sm:p-4 transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-row items-center gap-3 sm:gap-5 cursor-pointer ${className}`}
    >
      {/* Rectangular Course Thumbnail */}
      <div className="relative w-24 h-24 xs:w-28 xs:h-28 sm:w-52 md:w-60 sm:h-36 shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-inner">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 120px, 240px"
          />
        ) : (
          <div
            className={`w-full h-full ${
              course.thumbnailBgColor || 'bg-indigo-600'
            } flex items-center justify-center text-white font-bold text-lg`}
          >
            {course.title.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Course Details (Center) */}
      <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg group-hover:text-[#5C4DF5] transition-colors truncate">
            {course.title}
          </h3>

          {/* Badges for mobile view in header */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            {course.isPopular && (
              <Badge variant="popular" className="text-[10px] px-2 py-0.5">
                Populaire
              </Badge>
            )}
            <Badge
              variant={course.status === 'Gratuite' ? 'free' : 'paid'}
              className="text-[10px] px-2 py-0.5"
            >
              {statusLabel}
            </Badge>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Metadata row */}
        <div className="flex items-center gap-2.5 sm:gap-4 mt-2 sm:mt-3 text-[11px] sm:text-xs text-gray-500 font-normal flex-wrap">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{course.duration}</span>
          </div>

          <div className="flex items-center gap-1">
            <Play className="w-3.5 h-3.5 text-gray-400" />
            <span>{course.lessonsCount} leçons</span>
          </div>

          <div className="flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5 text-gray-400" />
            <span>{course.level}</span>
          </div>
        </div>

        {/* Action Button for mobile positioned at bottom right */}
        <div className="flex sm:hidden justify-end mt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onDownload) onDownload(course.id);
            }}
            className="bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer inline-flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            <span>Télécharger</span>
          </button>
        </div>
      </div>

      {/* Right section on Desktop: Badges + Télécharger Action */}
      <div className="hidden sm:flex flex-col items-end justify-center gap-3 shrink-0 pl-2">
        <div className="flex items-center gap-2">
          {course.isPopular && <Badge variant="popular">Populaire</Badge>}
          <Badge variant={course.status === 'Gratuite' ? 'free' : 'paid'}>
            {statusLabel}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onDownload) onDownload(course.id);
            }}
            className="bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-medium px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-sm active:scale-95 inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Télécharger</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
