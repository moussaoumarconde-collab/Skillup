'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

export default function MotDePasseOubliePage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Veuillez renseigner votre adresse email.');
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(email.trim());
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Impossible d’envoyer le lien de réinitialisation.');
      return;
    }

    setSuccessMessage(
      'Si un compte existe pour cet email, un lien sécurisé de réinitialisation vous a été envoyé. Vérifiez votre boîte de réception ainsi que vos courriers indésirables.'
    );
  };

  return (
    <div className="w-full max-w-md mx-auto py-10 px-4">
      {/* Logo SkillUp au sommet */}
      <div className="text-center mb-6">
        <Link href="/connexion" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#5C4DF5] flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight">
            Skill<span className="text-[#5C4DF5]">Up</span>
          </span>
        </Link>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Plateforme mobile-first de formations en ligne
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#F0F2F6] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Mot de passe oublié
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Saisissez votre email pour recevoir les instructions de réinitialisation
          </p>
        </div>

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm p-3.5 rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-gray-700">
              Adresse email associée au compte
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="w-full bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#5C4DF5] focus:ring-2 focus:ring-[#5C4DF5]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <span>Envoi en cours...</span>
            ) : (
              <>
                <span>Envoyer le lien</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100 text-center">
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-[#5C4DF5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la connexion</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
