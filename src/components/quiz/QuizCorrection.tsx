import React from 'react';
import Link from 'next/link';
import { QuizQuestion as QuizQuestionType } from '@/types';
import { Check, X, ArrowLeft, RotateCcw, BookOpen } from 'lucide-react';

interface QuizCorrectionProps {
  quizTitle: string;
  courseTitle: string;
  questions: QuizQuestionType[];
  answers: Record<number, number>; // questionIndex -> selectedOptionIndex
  onBackToResult: () => void;
  onRestart: () => void;
}

export const QuizCorrection: React.FC<QuizCorrectionProps> = ({
  quizTitle,
  courseTitle,
  questions,
  answers,
  onBackToResult,
  onRestart,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header corrections */}
      <div className="bg-white rounded-2xl border border-[#F0F2F6] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#5C4DF5] bg-[#EDE9FE] px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 mb-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {courseTitle}
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            Corrections détaillées
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">{quizTitle}</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBackToResult}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Score</span>
          </button>
          <Link
            href="/quiz"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <span>Retour aux quiz</span>
          </Link>
        </div>
      </div>

      {/* Liste des questions corrigées */}
      <div className="space-y-4">
        {questions.map((question, qIndex) => {
          const selectedAnswer = answers[qIndex];
          const isCorrect = selectedAnswer === question.correctAnswer;
          const hasAnswered = selectedAnswer !== undefined;

          return (
            <div
              key={question.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm transition-all ${
                isCorrect ? 'border-emerald-200' : 'border-rose-200'
              }`}
            >
              {/* Statut question */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Question {qIndex + 1}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-md ${
                    isCorrect
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {isCorrect ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Réponse correcte</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Réponse incorrecte</span>
                    </>
                  )}
                </span>
              </div>

              {/* Énoncé */}
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4">
                {question.question}
              </h3>

              {/* Réponse de l'utilisateur & Bonne réponse */}
              <div className="space-y-2 text-xs sm:text-sm">
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                    isCorrect
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/50 border-rose-200 text-rose-950'
                  }`}
                >
                  <span className="font-semibold shrink-0">Votre réponse :</span>
                  <span>
                    {hasAnswered
                      ? question.options[selectedAnswer]
                      : 'Aucune réponse sélectionnée'}
                  </span>
                </div>

                {!isCorrect && (
                  <div className="p-3 rounded-xl border bg-emerald-50/50 border-emerald-200 text-emerald-950 flex items-start gap-2.5">
                    <span className="font-semibold shrink-0">Bonne réponse :</span>
                    <span>{question.options[question.correctAnswer]}</span>
                  </div>
                )}
              </div>

              {/* Explication pédagogique */}
              <div className="mt-4 pt-3.5 border-t border-gray-100 text-xs sm:text-sm text-gray-600 bg-gray-50/70 p-3.5 rounded-xl">
                <span className="font-semibold text-gray-900 block mb-1">
                  💡 Explication :
                </span>
                <p className="leading-relaxed">{question.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer de correction */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-6">
        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Recommencer ce quiz</span>
        </button>

        <Link
          href="/quiz"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <span>Retourner au catalogue des quiz</span>
        </Link>
      </div>
    </div>
  );
};
