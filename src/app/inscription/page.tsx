'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

type AccountRole = 'student' | 'instructor';

function InscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { signUp, user } = useAuth();

  // Étape 1 : Choix du rôle ('student' | 'instructor') | Étape 2 : Formulaire d'inscription
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<AccountRole | null>(null);

  // Formulaire
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Si déjà connecté, redirection immédiate
  React.useEffect(() => {
    if (user) {
      const defaultDest = user.user_metadata?.role === 'instructor' ? '/formateur' : '/';
      router.replace(redirectUrl || defaultDest);
    }
  }, [user, redirectUrl, router]);

  const handleSelectRole = (role: AccountRole) => {
    setSelectedRole(role);
  };

  const handleContinueToForm = () => {
    if (!selectedRole) {
      setErrorMessage('Veuillez sélectionner un type de compte pour continuer.');
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const handleBackToRoleSelect = () => {
    setErrorMessage(null);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const roleToSave = selectedRole || 'student';

    // Validations
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(
      email.trim(),
      password,
      firstName.trim(),
      lastName.trim(),
      roleToSave
    );
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Une erreur est survenue lors de l’inscription.');
      return;
    }

    // Redirection immédiate adaptée au rôle choisi (session active)
    const dest = redirectUrl || (roleToSave === 'instructor' ? '/formateur' : '/');
    router.replace(dest);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 sm:py-12 px-4">
      {/* Logo SkillUp au sommet */}
      <div className="text-center mb-6 sm:mb-8">
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

      {/* ========================================================================= */}
      {/* ÉTAPE 1 : CHOIX DU TYPE DE COMPTE (ÉLÈVE / FORMATEUR)                      */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-[#F0F2F6] p-6 sm:p-9 shadow-sm space-y-7">
          <div className="text-center space-y-1.5 max-w-lg mx-auto">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Comment souhaitez-vous utiliser SkillUp ?
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Choisissez votre type de compte pour personnaliser votre expérience.
            </p>
          </div>

          {/* Message d'alerte si tentative de validation sans choix */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Les 2 Cartes de Rôle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* CARTE 1 : ÉLÈVE */}
            <div
              onClick={() => handleSelectRole('student')}
              className={`relative rounded-2xl p-5 sm:p-6 border-2 transition-all cursor-pointer flex flex-col justify-between text-left select-none ${
                selectedRole === 'student'
                  ? 'border-[#5C4DF5] bg-[#F8F7FF] shadow-sm shadow-indigo-100 ring-2 ring-[#5C4DF5]/20'
                  : 'border-[#F0F2F6] bg-white hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl">👨‍🎓</span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedRole === 'student'
                        ? 'border-[#5C4DF5] bg-[#5C4DF5] text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selectedRole === 'student' && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">Élève</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                    Apprenez, suivez des formations, faites des quiz et progressez à votre rythme.
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRole('student');
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedRole === 'student'
                      ? 'bg-[#5C4DF5] text-white shadow-sm'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {selectedRole === 'student' ? 'Élève sélectionné' : 'Choisir Élève'}
                </button>
              </div>
            </div>

            {/* CARTE 2 : FORMATEUR */}
            <div
              onClick={() => handleSelectRole('instructor')}
              className={`relative rounded-2xl p-5 sm:p-6 border-2 transition-all cursor-pointer flex flex-col justify-between text-left select-none ${
                selectedRole === 'instructor'
                  ? 'border-[#5C4DF5] bg-[#F8F7FF] shadow-sm shadow-indigo-100 ring-2 ring-[#5C4DF5]/20'
                  : 'border-[#F0F2F6] bg-white hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl">🎓</span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedRole === 'instructor'
                        ? 'border-[#5C4DF5] bg-[#5C4DF5] text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selectedRole === 'instructor' && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">Formateur</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                    Partagez vos connaissances et préparez vos futurs contenus pédagogiques.
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRole('instructor');
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedRole === 'instructor'
                      ? 'bg-[#5C4DF5] text-white shadow-sm'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {selectedRole === 'instructor' ? 'Formateur sélectionné' : 'Choisir Formateur'}
                </button>
              </div>
            </div>
          </div>

          {/* Bouton pour poursuivre */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleContinueToForm}
              disabled={!selectedRole}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Continuer avec ce compte</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Lien vers Connexion */}
          <div className="pt-2 border-t border-gray-100 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              Vous avez déjà un compte ?{' '}
              <Link
                href="/connexion"
                className="font-bold text-[#5C4DF5] hover:text-[#4B3CE0] transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 2 : FORMULAIRE D'INSCRIPTION DIRECT                                  */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-[#F0F2F6] p-6 sm:p-9 shadow-sm space-y-6 max-w-md mx-auto">
          {/* En-tête avec bouton de retour */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <button
              type="button"
              onClick={handleBackToRoleSelect}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modifier mon choix</span>
            </button>

            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5C4DF5] bg-[#EDE9FE] px-2.5 py-1 rounded-full">
              {selectedRole === 'instructor' ? '🎓 Formateur' : '👨‍🎓 Élève'}
            </span>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {selectedRole === 'instructor'
                ? 'Créer votre compte Formateur'
                : 'Créer votre compte Élève'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Remplissez les informations ci-dessous pour finaliser votre inscription
            </p>
          </div>

          {/* Message d'erreur */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-gray-700">
                  Prénom
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Max"
                    className="w-full bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#5C4DF5] focus:ring-2 focus:ring-[#5C4DF5]/15 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className="w-full bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#5C4DF5] focus:ring-2 focus:ring-[#5C4DF5]/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                />
              </div>
            </div>

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
              <label className="block text-xs font-semibold text-gray-700">
                Mot de passe (min. 6 caractères)
              </label>
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

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
                <span>Création en cours...</span>
              ) : (
                <>
                  <span>Créer mon compte et entrer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-gray-100 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              Vous avez déjà un compte ?{' '}
              <Link
                href="/connexion"
                className="font-bold text-[#5C4DF5] hover:text-[#4B3CE0] transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-gray-400">Chargement...</div>}>
      <InscriptionContent />
    </Suspense>
  );
}
