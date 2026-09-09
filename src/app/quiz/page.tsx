'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, BookOpen, ArrowRight } from 'lucide-react';
import type { Quiz } from '@/types';

export default function QuizCatalogPage() {
  // Liste réelle des quiz (vide tant que des formations avec quiz ne sont pas publiées)
  const quizzes: Quiz[] = [];
  const totalQuizzes = quizzes.length;

  return (
    <div className="py-4 sm:py-6 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Bannière d'en-tête du catalogue Quiz */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-[#F0F2F6] shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center shrink-0 shadow-xs">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Quiz & Évaluations
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
              Testez vos connaissances, validez vos acquis et progressez vers la certification.
            </p>
          </div>
        </div>
      </div>

      {/* Liste des quiz ou État vide réel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Quiz disponibles ({totalQuizzes})
          </h2>
        </div>

        {totalQuizzes === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5C4DF5] flex items-center justify-center mx-auto mb-1">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
              Aucun quiz disponible pour le moment
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Les quiz sont créés par les formateurs et liés directement aux formations. Rejoignez un cours pour débloquer ses quiz d'évaluation !
            </p>
            <div className="pt-3">
              <Link
                href="/formations"
                className="inline-flex items-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explorer les formations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Si des quiz sont disponibles */}
          </div>
        )}
      </div>
    </div>
  );
}
