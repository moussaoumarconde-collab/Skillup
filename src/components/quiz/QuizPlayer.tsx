'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Quiz } from '@/types';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { QuizResult } from './QuizResult';
import { QuizCorrection } from './QuizCorrection';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface QuizPlayerProps {
  quiz: Quiz;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showCorrections, setShowCorrections] = useState<boolean>(false);

  const totalQuestions = quiz.questions.length;
  const currentQuestion = quiz.questions[currentQuestionIndex];

  // Calcul du score
  const calculateScore = () => {
    return quiz.questions.reduce((acc, q, idx) => {
      return acc + (answers[idx] === q.correctAnswer ? 1 : 0);
    }, 0);
  };

  const handleSelectAnswer = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    setIsCompleted(true);
    setShowCorrections(false);
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setShowCorrections(false);
  };

  const handleViewCorrections = () => {
    setShowCorrections(true);
  };

  const handleBackToResult = () => {
    setShowCorrections(false);
  };

  // 1. Vue Corrections
  if (showCorrections) {
    return (
      <QuizCorrection
        quizTitle={quiz.title}
        courseTitle={quiz.courseTitle}
        questions={quiz.questions}
        answers={answers}
        onBackToResult={handleBackToResult}
        onRestart={handleRestart}
      />
    );
  }

  // 2. Vue Résultat
  if (isCompleted) {
    const score = calculateScore();
    return (
      <QuizResult
        quizTitle={quiz.title}
        courseTitle={quiz.courseTitle}
        score={score}
        totalQuestions={totalQuestions}
        onViewCorrections={handleViewCorrections}
        onRestart={handleRestart}
      />
    );
  }

  // 3. Vue Question par question
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* En-tête : navigation et informations du quiz */}
      <div className="bg-white rounded-2xl border border-[#F0F2F6] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-[#5C4DF5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux quiz</span>
          </Link>
          <span className="text-xs font-semibold text-[#5C4DF5] bg-[#EDE9FE] px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {quiz.courseTitle}
          </span>
        </div>

        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-snug">
            {quiz.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {quiz.moduleName}
          </p>
        </div>

        {/* Barre de progression */}
        <div className="pt-2 border-t border-gray-100">
          <QuizProgress
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
          />
        </div>
      </div>

      {/* Question active */}
      <QuizQuestion
        question={currentQuestion}
        questionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        selectedAnswerIndex={answers[currentQuestionIndex]}
        onSelectAnswer={handleSelectAnswer}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
