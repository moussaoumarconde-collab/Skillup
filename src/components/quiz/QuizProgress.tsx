import React from 'react';

interface QuizProgressProps {
  currentQuestionIndex: number; // 0-based
  totalQuestions: number;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestionIndex,
  totalQuestions,
}) => {
  const currentNumber = currentQuestionIndex + 1;
  const progressPercent = Math.round((currentNumber / totalQuestions) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="font-semibold text-gray-700">
          Question {currentNumber} <span className="text-gray-400 font-normal">sur {totalQuestions}</span>
        </span>
        <span className="font-bold text-[#5C4DF5]">
          {progressPercent}%
        </span>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-[#5C4DF5] h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
