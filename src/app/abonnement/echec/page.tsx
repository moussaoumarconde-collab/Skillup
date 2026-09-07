'use client';

import React from 'react';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

export default function AbonnementEchecPage() {
  return (
    <div className="max-w-xl mx-auto py-10 sm:py-16 px-4">
      <div className="bg-white rounded-3xl border border-[#F0F2F6] p-8 sm:p-10 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm shadow-rose-100">
          <XCircle className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Paiement non finalisé
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            Le paiement de votre abonnement a été annulé ou n'a pas pu aboutir auprès de FedaPay.
            Aucun montant n'a été prélevé sur votre compte.
          </p>
        </div>

        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-xs sm:text-sm text-rose-900 text-left space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-rose-800">
            <HelpCircle className="w-4 h-4" />
            <span>Que s'est-il passé ?</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-rose-700/90 pl-1">
            <li>La transaction a peut-être été interrompue avant confirmation.</li>
            <li>Le solde de votre compte Mobile Money ou carte était insuffisant.</li>
            <li>Le délai d'attente de validation de l'opérateur a expiré.</li>
          </ul>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/abonnement"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer le paiement</span>
          </Link>

          <Link
            href="/formateur"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Espace formateur</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
