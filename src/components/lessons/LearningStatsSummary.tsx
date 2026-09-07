'use client';

import React from 'react';
import { BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';

interface LearningStatsSummaryProps {
  inProgressCount: number;
  completedLessonsCount: number;
  averageProgress: number;
}

export const LearningStatsSummary: React.FC<LearningStatsSummaryProps> = ({
  inProgressCount,
  completedLessonsCount,
  averageProgress,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 select-none">
      {/* 1. Formations en cours */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 shadow-xs flex items-center gap-3 sm:gap-3.5 h-full">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5C4DF5] flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">
            En cours
          </p>
          <p className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 truncate">
            {inProgressCount} formations
          </p>
        </div>
      </div>

      {/* 2. Leçons terminées */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 shadow-xs flex items-center gap-3 sm:gap-3.5 h-full">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">
            Leçons terminées
          </p>
          <p className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 truncate">
            {completedLessonsCount} leçons
          </p>
        </div>
      </div>

      {/* 3. Progression moyenne */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 shadow-xs flex items-center gap-3 sm:gap-3.5 h-full">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">
            Progression moyenne
          </p>
          <p className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 truncate">
            {averageProgress}%
          </p>
        </div>
      </div>
    </div>
  );
};
