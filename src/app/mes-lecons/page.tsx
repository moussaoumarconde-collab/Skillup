'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { LearningStatsSummary } from '@/components/lessons/LearningStatsSummary';
import { ProgressCourseCard } from '@/components/lessons/ProgressCourseCard';
import type { UserCourseProgress } from '@/data/mockData';

export default function MesLeconsPage() {
  const [activeTab, setActiveTab] = useState<'in_progress' | 'completed'>(
    'in_progress'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Liste réelle de progression (vide pour un nouveau compte)
  const [userProgress] = useState<UserCourseProgress[]>([]);

  const inProgressList = userProgress.filter(
    (item) => item.status === 'in_progress'
  );
  const completedList = userProgress.filter(
    (item) => item.status === 'completed'
  );

  const displayedList = activeTab === 'in_progress' ? inProgressList : completedList;

  // Calculs statistiques exacts
  const completedLessonsCount = inProgressList.reduce(
    (acc, curr) => acc + curr.completedLessons,
    0
  );
  const averageProgress =
    inProgressList.length > 0
      ? Math.round(
          inProgressList.reduce((acc, curr) => acc + curr.progressPercentage, 0) /
            inProgressList.length
        )
      : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-5 sm:space-y-7 py-2 sm:py-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Contexte & Action rapide */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
          Suivez votre progression et reprenez votre apprentissage là où vous vous êtes arrêté.
        </p>

        <Link
          href="/formations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C4DF5] hover:text-[#4B3CE0] bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>Découvrir des formations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 1. Résumé des métriques d'apprentissage réelles */}
      <LearningStatsSummary
        inProgressCount={inProgressList.length}
        completedLessonsCount={completedLessonsCount}
        averageProgress={averageProgress}
      />

      {/* 2. Onglets En cours / Terminées */}
      <section className="space-y-4 pt-1">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('in_progress')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'in_progress'
                  ? 'bg-[#5C4DF5] text-white shadow-xs'
                  : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200/80'
              }`}
            >
              En cours ({inProgressList.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-[#5C4DF5] text-white shadow-xs'
                  : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200/80'
              }`}
            >
              Terminées ({completedList.length})
            </button>
          </div>

          <Link
            href="/formations"
            className="sm:hidden text-xs font-semibold text-[#5C4DF5]"
          >
            Explorer
          </Link>
        </div>

        {/* 3. Liste des cartes de formations */}
        <div className="space-y-3 sm:space-y-3.5">
          {displayedList.length > 0 ? (
            displayedList.map((item) => (
              <ProgressCourseCard
                key={item.courseId}
                item={item}
                onToast={showToast}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-100 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5C4DF5] flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Aucune formation {activeTab === 'completed' ? 'terminée pour le moment' : 'en cours'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                {activeTab === 'completed'
                  ? 'Complétez les leçons de vos cours en cours pour débloquer vos certificats.'
                  : 'Explorez le catalogue de formations et commencez votre premier cours dès aujourd’hui.'}
              </p>
              <div className="pt-2">
                <Link
                  href="/formations"
                  className="inline-flex items-center gap-1.5 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <span>Découvrir des formations</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
