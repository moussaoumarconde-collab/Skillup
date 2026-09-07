'use client';

import React, { useState } from 'react';
import { ChevronDown, Play, Video, FileText, CheckCircle2, Lock, BookOpen } from 'lucide-react';
import { Module, Lesson } from '@/types';

interface CourseCurriculumProps {
  modules?: Module[];
  totalDuration?: string;
  totalLessons?: number;
}

export const CourseCurriculum: React.FC<CourseCurriculumProps> = ({
  modules = [],
  totalDuration,
  totalLessons,
}) => {
  // Par défaut, le premier module est ouvert
  const [openModuleIds, setOpenModuleIds] = useState<string[]>(
    modules.length > 0 ? [modules[0].id] : []
  );

  const toggleModule = (id: string) => {
    setOpenModuleIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const totalLessonsCount =
    totalLessons ||
    modules.reduce((acc, m) => acc + (m.lessons ? m.lessons.length : 0), 0);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-7 md:p-8 shadow-xs space-y-5">
      {/* En-tête du curriculum */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-gray-900">
            Programme de la formation
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {modules.length} modules • {totalLessonsCount} leçons
            {totalDuration ? ` • ${totalDuration} au total` : ''}
          </p>
        </div>

        {/* Bouton tout ouvrir / tout fermer */}
        {modules.length > 1 && (
          <button
            type="button"
            onClick={() => {
              if (openModuleIds.length === modules.length) {
                setOpenModuleIds([]);
              } else {
                setOpenModuleIds(modules.map((m) => m.id));
              }
            }}
            className="text-xs font-semibold text-[#5C4DF5] hover:text-[#4B3CE0] transition-colors self-start sm:self-auto cursor-pointer"
          >
            {openModuleIds.length === modules.length
              ? 'Tout replier'
              : 'Tout déplier'}
          </button>
        )}
      </div>

      {/* Liste des modules en accordéon simple */}
      <div className="space-y-3">
        {modules.map((module, modIndex) => {
          const isOpen = openModuleIds.includes(module.id);
          const lessons = module.lessons || [];

          return (
            <div
              key={module.id}
              className="border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden transition-colors"
            >
              {/* En-tête du module */}
              <button
                type="button"
                onClick={() => toggleModule(module.id)}
                className="w-full bg-gray-50/70 hover:bg-gray-100/70 p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-[#5C4DF5] font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {modIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {module.title}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      {lessons.length} leçons
                    </p>
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#5C4DF5]' : ''
                  }`}
                />
              </button>

              {/* Contenu du module (Leçons) */}
              {isOpen && (
                <div className="divide-y divide-gray-100 bg-white">
                  {lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 text-xs hover:bg-purple-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {lesson.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                            <Play className="w-2 h-2 text-gray-500 fill-gray-500 ml-0.5" />
                          </div>
                        )}
                        <span className="text-gray-400 font-medium shrink-0">
                          {modIndex + 1}.{lessonIndex + 1}
                        </span>
                        <span className="font-medium text-gray-800 truncate">
                          {lesson.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-gray-400 text-[11px]">
                        <Video className="w-3.5 h-3.5 text-gray-400 hidden xs:inline-block" />
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
