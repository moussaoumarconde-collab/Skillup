import React from 'react';
import { quizzesList } from '@/data/mockData';
import { QuizCard } from '@/components/quiz/QuizCard';
import { Trophy, Sparkles, CheckCircle, BarChart2 } from 'lucide-react';

export default function QuizCatalogPage() {
  const completedCount = quizzesList.filter((q) => q.status === 'completed').length;
  const totalQuizzes = quizzesList.length;

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
                <span className="text-[11px] font-bold text-[#5C4DF5] bg-[#EDE9FE] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  V1
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Testez vos connaissances, validez vos acquis et progressez vers la certification.
              </p>
            </div>
          </div>

          {/* Mini-statistiques */}
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

      {/* Liste des quiz disponibles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Quiz disponibles ({quizzesList.length})
          </h2>
          <span className="text-xs text-gray-400">
            10 questions par quiz
          </span>
        </div>

        {/* Grille rectangulaire 1 col mobile, 2 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {quizzesList.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      </div>
    </div>
  );
}
