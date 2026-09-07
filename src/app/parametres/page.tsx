import React from 'react';
import Link from 'next/link';
import { Settings, ArrowLeft } from 'lucide-react';

export default function ParametresPage() {
  return (
    <div className="py-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0F2F6] shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Paramètres</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Gestion des préférences et configuration de compte.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5C4DF5] bg-[#EDE9FE] px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
