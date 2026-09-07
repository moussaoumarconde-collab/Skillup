import React from 'react';
import { notFound } from 'next/navigation';
import { quizzesList } from '@/data/mockData';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return quizzesList.map((quiz) => ({
    id: quiz.id,
  }));
}

export default async function QuizDetailPage({ params }: PageProps) {
  const { id } = await params;
  const quiz = quizzesList.find((q) => q.id === id);

  // Cas où le quiz n'existe pas : déclenche un véritable code HTTP 404
  if (!quiz) {
    notFound();
  }

  return (
    <div className="py-2 sm:py-4">
      <QuizPlayer quiz={quiz} />
    </div>
  );
}
