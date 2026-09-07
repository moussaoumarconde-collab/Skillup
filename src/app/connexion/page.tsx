'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Sparkles, UserCheck } from 'lucide-react';

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { signIn, signInDemo, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Si déjà connecté, rediriger immédiatement dans l'application
  React.useEffect(() => {
    if (user) {
      router.replace(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  // Détection d'un message d'erreur passé dans l'URL (ex: échec callback)
  React.useEffect(() => {
    const errParam = searchParams.get('error');
    if (errParam === 'auth_callback_failed') {
      setErrorMessage(
        'Le lien de confirmation a expiré ou est invalide. Veuillez vous connecter ou redemander un lien.'
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email.trim(), password);
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Email ou mot de passe incorrect.');
      return;
    }

    router.replace(redirectUrl);
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    await signInDemo();
    setIsDemoLoading(false);
    router.replace(redirectUrl);
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

      {/* Carte blanche de connexion */}
      <div className="bg-white rounded-3xl border border-[#F0F2F6] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Connexion
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Entrez vos identifiants pour entrer dans l'application
          </p>
        </div>

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-gray-700">
              Adresse email
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

          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700">
                Mot de passe
              </label>
              <Link
                href="/mot-de-passe-oublie"
                className="text-xs font-medium text-[#5C4DF5] hover:text-[#4B3CE0] transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#5C4DF5] focus:ring-2 focus:ring-[#5C4DF5]/15 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                title={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isDemoLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <span>Connexion en cours...</span>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Séparateur */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-100 w-full" />
          <span className="bg-white px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            ou
          </span>
          <div className="border-t border-gray-100 w-full" />
        </div>

        {/* Bouton d'accès rapide Démo */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading || isDemoLoading}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#F8F7FF] hover:bg-[#EDE9FE] text-[#5C4DF5] border border-[#ECEAFE] text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-60"
        >
          <UserCheck className="w-4 h-4" />
          <span>{isDemoLoading ? 'Chargement...' : 'Accès rapide Démo (1 clic)'}</span>
        </button>

        {/* Lien vers Inscription */}
        <div className="pt-2 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Vous n'avez pas encore de compte ?{' '}
            <Link
              href="/inscription"
              className="font-bold text-[#5C4DF5] hover:text-[#4B3CE0] transition-colors"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-gray-400">Chargement...</div>}>
      <ConnexionForm />
    </Suspense>
  );
}
