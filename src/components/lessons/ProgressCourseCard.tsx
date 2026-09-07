'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';
import { UserCourseProgress } from '@/data/mockData';

interface ProgressCourseCardProps {
  item: UserCourseProgress;
  onToast?: (msg: string) => void;
}

export const ProgressCourseCard: React.FC<ProgressCourseCardProps> = ({
  item,
  onToast,
}) => {
  const router = useRouter();
  const isCompleted = item.status === 'completed';

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToast) {
      onToast(
        isCompleted
          ? `Ouverture de « ${item.course.title} »`
          : `Reprise de « ${item.course.title} »`
      );
    }
    router.push(`/formations/${item.courseId}`);
  };

  return (
    <div
      onClick={() => router.push(`/formations/${item.courseId}`)}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 p-3.5 sm:p-4 transition-all duration-200 hover:shadow-md flex flex-row items-center gap-3.5 sm:gap-5 cursor-pointer"
    >
      {/* Vignette rectangulaire sobre (visuel existant) */}
      <div className="relative w-24 h-24 xs:w-28 xs:h-28 sm:w-44 md:w-52 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-inner">
        {item.course.thumbnail ? (
          <Image
            src={item.course.thumbnail}
            alt={item.course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 120px, 200px"
          />
        ) : (
          <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold">
            {item.course.title.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Détails du cours et progression */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isCompleted ? (
              <span className="bg-emerald-50 text-emerald-600 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Terminé 100%
              </span>
            ) : (
              <span className="bg-purple-50 text-[#5C4DF5] text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full">
                En cours
              </span>
            )}
            <span className="text-[11px] text-gray-400 truncate hidden sm:inline">
              {item.course.instructor.name}
            </span>
          </div>

          <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-[#5C4DF5] transition-colors truncate">
            {item.course.title}
          </h3>

          <p className="text-xs text-gray-500 truncate mt-0.5">
            {item.currentModuleName} • {item.currentLessonName}
          </p>
        </div>

        {/* Barre de progression avec calcul exact */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-500">
            <span>
              {item.completedLessons}/{item.totalLessons} leçons
            </span>
            <span className="font-bold text-gray-900">
              {item.progressPercentage}%
            </span>
          </div>

          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500' : 'bg-[#5C4DF5]'
              }`}
              style={{ width: `${item.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Bouton d'action sur mobile (affiché en bas à droite) */}
        <div className="flex sm:hidden justify-end pt-1">
          <button
            type="button"
            onClick={handleAction}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer inline-flex items-center gap-1 ${
              isCompleted
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white'
            }`}
          >
            {isCompleted ? (
              <>
                <RotateCcw className="w-3 h-3" />
                <span>Revoir</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-white" />
                <span>Continuer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bouton d'action sur desktop */}
      <div className="hidden sm:flex flex-col items-end justify-center shrink-0 pl-2">
        <button
          type="button"
          onClick={handleAction}
          className={`text-xs sm:text-sm font-semibold px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs active:scale-95 inline-flex items-center justify-center gap-1.5 cursor-pointer ${
            isCompleted
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white'
          }`}
        >
          {isCompleted ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revoir le cours</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Continuer</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
