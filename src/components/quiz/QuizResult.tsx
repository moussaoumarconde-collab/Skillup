import React from 'react';
import Link from 'next/link';
import { Trophy, CheckCircle2, XCircle, ArrowLeft, RotateCcw, Eye } from 'lucide-react';

interface QuizResultProps {
  quizTitle: string;
  courseTitle: string;
  score: number; // correct count
  totalQuestions: number;
  onViewCorrections: () => void;
  onRestart: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  quizTitle,
  courseTitle,
  score,
  totalQuestions,
  onViewCorrections,
  onRestart,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const isPassed = percentage >= 70;
  const incorrectCount = totalQuestions - score;

  return (
    <div className="bg-white rounded-3xl border border-[#F0F2F6] p-6 sm:p-10 shadow-sm text-center max-w-2xl mx-auto space-y-6">
      {/* Icône de statut */}
      <div className="mx-auto">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm ${
            isPassed
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-amber-50 text-amber-600'
          }`}
        >
          <Trophy className="w-8 h-8" />
        </div>
      </div>

      {/* Titres */}
      <div className="space-y-1">
        <span className="text-xs font-semibold text-[#5C4DF5] bg-[#EDE9FE] px-3 py-1 rounded-full inline-block mb-1">
          {courseTitle}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Quiz terminé !
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">{quizTitle}</p>
      </div>

      {/* Carte du Score principal */}
      <div className="bg-[#F8F7FF] rounded-2xl p-6 border border-[#ECEAFE] max-w-sm mx-auto space-y-2">
        <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          {score} <span className="text-xl sm:text-2xl text-gray-400 font-normal">/ {totalQuestions}</span>
        </div>
        <div className="text-lg font-bold text-[#5C4DF5]">
          {percentage}%
        </div>
        <div className="pt-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold ${
              isPassed
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isPassed ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Quiz réussi
              </>
            ) : (
              <>
                <span>💡</span>
                Quiz à revoir
              </>
            )}
          </span>
        </div>
        {!isPassed && (
          <p className="text-xs text-gray-500 pt-1">
            Prenez le temps de revoir les points clés du cours pour consolider vos acquis.
          </p>
        )}
      </div>

      {/* Détails : Correctes vs Incorrectes */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-gray-500 font-medium">Correctes</div>
            <div className="text-base font-bold text-gray-900">{score}</div>
          </div>
        </div>

        <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-gray-500 font-medium">Incorrectes</div>
            <div className="text-base font-bold text-gray-900">{incorrectCount}</div>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onViewCorrections}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>Voir les corrections</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-gray-200 transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Recommencer</span>
        </button>

        <Link
          href="/quiz"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux quiz</span>
        </Link>
      </div>
    </div>
  );
};
