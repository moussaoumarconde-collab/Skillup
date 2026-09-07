import React from 'react';
import { QuizQuestion as QuizQuestionType } from '@/types';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswerIndex: number | undefined;
  onSelectAnswer: (optionIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswerIndex,
  onSelectAnswer,
  onPrevious,
  onNext,
  onSubmit,
}) => {
  const isFirst = questionIndex === 0;
  const isLast = questionIndex === totalQuestions - 1;
  const hasAnswered = selectedAnswerIndex !== undefined;

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-white rounded-2xl border border-[#F0F2F6] p-5 sm:p-8 shadow-sm space-y-6">
      {/* Énoncé de la question */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C4DF5] bg-[#EDE9FE] px-2.5 py-1 rounded-md">
          Question {questionIndex + 1}
        </span>
        <h2 className="text-base sm:text-xl font-bold text-gray-900 mt-3 leading-snug">
          {question.question}
        </h2>
      </div>

      {/* 4 Propositions de réponse */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswerIndex === index;

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectAnswer(index)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3.5 cursor-pointer select-none active:scale-[0.99] ${
                isSelected
                  ? 'border-[#5C4DF5] bg-[#F8F7FF] shadow-sm ring-2 ring-[#5C4DF5]/20'
                  : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50/50 bg-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#5C4DF5] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {optionLetters[index]}
                </span>
                <span
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'
                  }`}
                >
                  {option}
                </span>
              </div>

              {/* Indicateur de coche */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#5C4DF5] text-white'
                    : 'border border-gray-300'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Barre d'action et boutons de navigation */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
        {/* Précédent */}
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            isFirst
              ? 'text-gray-300 cursor-not-allowed bg-gray-50 border border-gray-100'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 cursor-pointer active:scale-95'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Précédent</span>
        </button>

        {/* Suivant ou Terminer */}
        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Terminer le quiz</span>
            <Check className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Suivant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
