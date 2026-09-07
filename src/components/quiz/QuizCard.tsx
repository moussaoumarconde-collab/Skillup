import React from 'react';
import Link from 'next/link';
import { Quiz } from '@/types';
import { HelpCircle, Clock, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

interface QuizCardProps {
  quiz: Quiz;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const isCompleted = quiz.status === 'completed';

  return (
    <div className="bg-white rounded-2xl border border-[#F0F2F6] p-5 sm:p-6 shadow-sm hover:border-purple-200 transition-all flex flex-col justify-between group">
      <div>
        {/* En-tête : Cours & Statut */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C4DF5] bg-[#EDE9FE] px-2.5 py-1 rounded-lg">
            <BookOpen className="w-3.5 h-3.5" />
            {quiz.courseTitle}
          </span>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Terminé
            </span>
          ) : (
            <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
              Disponible
            </span>
          )}
        </div>

        {/* Titre et Module */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#5C4DF5] transition-colors leading-snug">
          {quiz.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1">
          {quiz.moduleName}
        </p>

        {/* Métadonnées : Questions & Durée */}
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-gray-400" />
            <span>{quiz.questionsCount} questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{quiz.estimatedDuration}</span>
          </div>
        </div>
      </div>

      {/* Bouton d'action */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Seuil de réussite : <strong className="text-gray-700 font-semibold">70%</strong>
        </span>
        <Link
          href={`/quiz/${quiz.id}`}
          className="inline-flex items-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <span>{isCompleted ? 'Recommencer' : 'Commencer le quiz'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
