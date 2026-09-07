'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, Sparkles, Clock, ArrowRight } from 'lucide-react';

interface ResumeHeroCardProps {
  courseId: string;
  courseTitle: string;
  moduleName: string;
  lessonName: string;
  progressPercentage: number;
  thumbnail: string;
  onToast?: (msg: string) => void;
}

export const ResumeHeroCard: React.FC<ResumeHeroCardProps> = ({
  courseId,
  courseTitle,
  moduleName,
  lessonName,
  progressPercentage,
  thumbnail,
  onToast,
}) => {
  const router = useRouter();

  const handleResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToast) onToast(`Reprise de « ${lessonName} »`);
    router.push(`/formations/${courseId}`);
  };

  return (
    <div
      onClick={() => router.push(`/formations/${courseId}`)}
      className="group bg-white rounded-2xl sm:rounded-3xl border-2 border-[#5C4DF5]/20 hover:border-[#5C4DF5]/40 ring-4 ring-[#5C4DF5]/5 p-4 sm:p-6 transition-all duration-300 shadow-md hover:shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 cursor-pointer relative overflow-hidden"
    >
      {/* Vignette rectangulaire sobre (visuel existant du cours) */}
      <div className="relative w-full sm:w-60 md:w-72 h-36 sm:h-40 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
        <Image
          src={thumbnail}
          alt={courseTitle}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, 300px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden" />
        <span className="absolute bottom-2 left-2 sm:hidden bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-[#5C4DF5]" />
          Dernière session
        </span>
      </div>

      {/* Contenu et progression */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-3">
        <div>
          {/* Badge en-tête */}
          <div className="hidden sm:flex items-center gap-2 mb-1.5">
            <span className="bg-[#EDE9FE] text-[#5C4DF5] text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Dernière leçon suivie
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {courseTitle}
            </span>
          </div>

          <p className="text-xs text-[#5C4DF5] font-semibold sm:hidden">
            {courseTitle} • {moduleName}
          </p>

          <h3 className="font-extrabold text-gray-900 text-base sm:text-xl group-hover:text-[#5C4DF5] transition-colors line-clamp-1 leading-snug">
            {lessonName}
          </h3>

          <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
            {moduleName}
          </p>
        </div>

        {/* Barre de progression avec calcul exact */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-500">Progression</span>
            <span className="text-[#5C4DF5]">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5C4DF5] rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Bouton d'action proéminent */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={handleResume}
            className="w-full sm:w-auto bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-bold px-5 py-2.5 sm:py-3 rounded-xl transition-all shadow-md shadow-indigo-200/50 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Reprendre la leçon</span>
            <ArrowRight className="w-4 h-4 hidden sm:inline-block" />
          </button>
        </div>
      </div>
    </div>
  );
};
