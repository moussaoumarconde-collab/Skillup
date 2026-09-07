import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function QuizNotFound() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center">
      <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Quiz introuvable
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          Le quiz demandé n’existe pas ou a été déplacé. Vous pouvez explorer la liste de tous nos quiz d’évaluation.
        </p>
        <div className="pt-2">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux quiz</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
