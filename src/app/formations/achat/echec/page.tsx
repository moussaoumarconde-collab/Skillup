'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw, BookOpen } from 'lucide-react';

function CoursePurchaseEchecContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course_id') || '';

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-16 px-4">
      <div className="bg-white rounded-3xl border border-[#F0F2F6] p-6 sm:p-10 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm shadow-rose-100">
          <XCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Paiement non finalisé
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
            La transaction a été annulée ou n’a pas pu être validée par votre opérateur Mobile Money. Aucun montant n’a été débité de votre compte.
          </p>
        </div>

        <div className="bg-[#F8F9FC] border border-gray-100 rounded-2xl p-4 text-xs text-gray-600 text-left space-y-2">
          <p className="font-semibold text-gray-800">Conseils pour réussir votre achat :</p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>Vérifiez que votre solde Mobile Money est suffisant.</li>
            <li>Assurez-vous d’avoir approuvé la notification de paiement sur votre téléphone.</li>
            <li>Vérifiez la qualité de votre connexion internet.</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {courseId ? (
            <Link
              href={`/formations/${courseId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Réessayer l'achat</span>
            </Link>
          ) : (
            <Link
              href="/formations"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Retour aux formations</span>
            </Link>
          )}

          <Link
            href="/formations"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold px-5 py-3.5 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Catalogue</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CoursePurchaseEchecPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-xs text-gray-400">Chargement...</div>}>
      <CoursePurchaseEchecContent />
    </Suspense>
  );
}
