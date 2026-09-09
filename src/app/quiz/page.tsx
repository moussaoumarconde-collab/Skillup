'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, CheckCircle, BarChart2, BookOpen, ArrowRight } from 'lucide-react';
import type { Quiz } from '@/types';

export default function QuizCatalogPage() {
  // Liste réelle des quiz (vide tant que des formations avec quiz ne sont pas publiées)
  const quizzes: Quiz[] = [];

  const completedCount = 0;
  const totalQuizzes = quizzes.length;

  return (
    <div className="py-4 sm:py-6 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Bannière d'en-tête du catalogue Quiz */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#F0F2F6] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Quiz & Évaluations
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Testez vos connaissances, validez vos acquis et progressez vers la certification.
              </p>
            </div>
          </div>

          {/* Mini-statistiques réelles */}
          <div className="flex items-center gap-3 bg-[#F8F7FF] border border-[#ECEAFE] rounded-xl px-4 py-2.5 shrink-0 self-start sm:self-auto">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>
                <strong className="font-bold text-gray-900">{completedCount}</strong> / {totalQuizzes} complétés
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-700">
              <BarChart2 className="w-4 h-4 text-[#5C4DF5]" />
              <span>Seuil <strong>70%</strong></span>
            </div>
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
