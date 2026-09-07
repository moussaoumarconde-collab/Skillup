import React from 'react';
import { Loader2 } from 'lucide-react';

export default function CourseLoading() {
  return (
    <div className="max-w-5xl mx-auto py-12 sm:py-20 px-4 text-center">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-8 sm:p-14 shadow-xs space-y-3 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5C4DF5] flex items-center justify-center mx-auto animate-spin">
          <Loader2 className="w-6 h-6" />
        </div>
        <h2 className="font-bold text-gray-900 text-base sm:text-lg">
          Chargement de la formation...
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
          Récupération des informations et du programme pédagogique.
        </p>
      </div>
    </div>
  );
}
