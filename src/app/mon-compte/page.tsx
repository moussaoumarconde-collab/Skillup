'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  LogOut,
  BookOpen,
  Trophy,
  PlaySquare,
  ShieldCheck,
  Sparkles,
  Save,
  Settings,
  HelpCircle,
} from 'lucide-react';

export default function MonComptePage() {
  const router = useRouter();
  const { user, profile, updateProfile, signOut, isLoading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirection côté client si non connecté
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/connexion?redirect=/mon-compte');
    }
  }, [user, isLoading, router]);

  // Initialiser les valeurs du profil
  useEffect(() => {
    if (user) {
      const initialFirst =
        profile?.first_name || (user.user_metadata?.first_name as string) || '';
      const initialLast =
        profile?.last_name || (user.user_metadata?.last_name as string) || '';
      setFirstName(initialFirst);
      setLastName(initialLast);
    }
  }, [user, profile]);

  if (isLoading || !user) {
    return (
      <div className="py-16 text-center text-xs sm:text-sm text-gray-400">
        Chargement de votre compte...
      </div>
    );
  }

  const email = user.email || profile?.email || 'email@non-renseigne.com';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Apprenant SkillUp';
  const avatarUrl = profile?.avatar_url;
  const initials =
    (firstName?.[0] || '') + (lastName?.[0] || '') || email.slice(0, 2).toUpperCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Le prénom et le nom ne peuvent pas être vides.');
      return;
    }

    setIsSaving(true);
    const { error } = await updateProfile(firstName.trim(), lastName.trim());
    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message || 'Erreur lors de la mise à jour du profil.');
      return;
    }

    setSuccessMessage('Vos informations ont été mises à jour avec succès.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/connexion');
  };

  return (
    <div className="py-4 sm:py-6 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* 1. CARTE EN-TÊTE : PROFIL ACTUEL & AVATAR */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#F0F2F6] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar ou Placeholder élégant */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white shadow-sm ring-2 ring-purple-100 bg-[#EDE9FE] flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <span className="font-extrabold text-xl sm:text-2xl text-[#5C4DF5] select-none">
                  {initials}
                </span>
              )}
            </div>

            {/* Identité & Statut */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  {fullName}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5C4DF5] bg-[#EDE9FE] px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  {profile?.role === 'instructor' ? '🎓 Formateur' : '👨‍🎓 Élève'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{email}</span>
              </p>
            </div>
          </div>

          {/* Bouton de déconnexion */}
          <button
            type="button"
            onClick={handleSignOut}
            className="self-start sm:self-auto inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>

      {/* 2. FORMULAIRE D'ÉDITION DES INFORMATIONS PERSONNELLES */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#F0F2F6] shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Informations personnelles
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Modifiez votre prénom et votre nom affichés sur la plateforme
            </p>
          </div>
          <span className="text-xs font-semibold text-[#5C4DF5] bg-[#F8F7FF] border border-[#ECEAFE] px-3 py-1 rounded-lg hidden sm:block">
            Supabase RLS sécurisé
          </span>
        </div>

        {/* Messages de statut */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm p-3.5 rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prénom */}
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
                  placeholder="Votre prénom"
                  className="w-full bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#5C4DF5] focus:ring-2 focus:ring-[#5C4DF5]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* Nom */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-gray-700">
                Nom
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
                className="w-full bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#5C4DF5] focus:ring-2 focus:ring-[#5C4DF5]/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Email (Lecture seule / Sécurité) */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700">
                Adresse email
              </label>
              <span className="text-[11px] text-gray-400">
                Identifiant de compte principal (non modifiable)
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-500 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. ACCÈS RAPIDES AUX ACTIONS DU COMPTE */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 px-1">
          Raccourcis d'apprentissage
        </h3>

        <div className={`grid grid-cols-1 ${profile?.role === 'instructor' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-3 sm:gap-4`}>
          {profile?.role === 'instructor' && (
            <Link
              href="/formateur"
              className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-purple-200 shadow-sm hover:border-[#5C4DF5] transition-all flex items-center gap-3.5 group bg-purple-50/20"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 group-hover:text-[#5C4DF5] transition-colors">
                  Espace formateur
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Accéder à mon espace
                </p>
              </div>
            </Link>
          )}

          <Link
            href="/mes-lecons"
            className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0F2F6] shadow-sm hover:border-purple-200 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <PlaySquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 group-hover:text-[#5C4DF5] transition-colors">
                Mes leçons
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Reprendre mon apprentissage
              </p>
            </div>
          </Link>

          <Link
            href="/formations"
            className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0F2F6] shadow-sm hover:border-purple-200 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                Formations
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Explorer le catalogue
              </p>
            </div>
          </Link>

          <Link
            href="/quiz"
            className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0F2F6] shadow-sm hover:border-purple-200 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                Quiz
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Valider mes compétences
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. PARAMÈTRES & SUPPORT */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 px-1">
          Paramètres & Assistance
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link
            href="/parametres"
            className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0F2F6] shadow-sm hover:border-purple-200 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#EDE9FE] group-hover:text-[#5C4DF5] transition-all">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 group-hover:text-[#5C4DF5] transition-colors">
                Paramètres
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Gérer mes préférences et mon compte
              </p>
            </div>
          </Link>

          <Link
            href="/support"
            className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0F2F6] shadow-sm hover:border-purple-200 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#EDE9FE] group-hover:text-[#5C4DF5] transition-all">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 group-hover:text-[#5C4DF5] transition-colors">
                Aide & Support
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Centre d'assistance et contact
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
