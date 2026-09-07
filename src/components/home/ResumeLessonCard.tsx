'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, MoreVertical } from 'lucide-react';
import { currentUser } from '@/data/mockData';

export const ResumeLessonCard: React.FC = () => {
  const lesson = currentUser.lastLesson;
  if (!lesson) return null;

  return (
    <section className="w-full space-y-3">
      <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight px-1">
        Reprendre ma dernière leçon
      </h2>

      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-[#F0F2F6] hover:border-[#E2E8F0] shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-3 sm:gap-5">
        {/* Left: Video Thumbnail with Play Overlay */}
        <div className="relative w-20 sm:w-28 h-16 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-gray-900 group cursor-pointer">
          <Image
            src={lesson.thumbnail}
            alt={lesson.lessonName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
            sizes="112px"
          />
          {/* Centered Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-xs border border-white/70 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Center: Course & Lesson details + Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#5C4DF5]">{lesson.courseTitle}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-400 font-medium">{lesson.moduleName} • Leçon 7</span>
          </div>

          <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate mt-0.5">
            {lesson.lessonName}
          </h3>

          {/* Progress Bar Row */}
          <div className="flex items-center gap-2.5 mt-2">
            <div className="h-1.5 w-36 sm:w-56 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5C4DF5] rounded-full transition-all duration-700"
                style={{ width: `${lesson.progressPercentage}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-gray-400">
              {lesson.progressPercentage}%
            </span>
          </div>
        </div>

        {/* Right: Button "Continuer ▷" and desktop options */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/mes-lecons"
            className="bg-[#F4F3FF] hover:bg-[#EDE9FE] text-[#5C4DF5] font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span>Continuer</span>
            <Play className="w-3 h-3 fill-[#5C4DF5]" />
          </Link>

          <button
            type="button"
            className="hidden sm:flex text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            title="Options de la leçon"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
