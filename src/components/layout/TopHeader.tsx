'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Bell, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { currentUser } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

export const TopHeader: React.FC = () => {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  const displayName = user
    ? (profile?.first_name || user.user_metadata?.first_name || user.email?.split('@')[0] || 'Apprenant')
    : null;

  const userRole = profile?.role || (user?.user_metadata?.role as string) || 'student';
  const userRoleLabel = userRole === 'instructor' ? 'Formateur' : 'Élève';

  const avatarUrl =
    profile?.avatar_url ||
    (userRole === 'instructor'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');

  const getPageInfo = () => {
    if (pathname === '/') {
      return {
        title: user ? `Bonjour, ${displayName} 👋` : 'Bienvenue sur SkillUp 👋',
        subtitle: user ? 'Prêt à apprendre aujourd’hui ?' : 'Découvrez nos formations et développez vos compétences',
      };
    }
    if (pathname.startsWith('/formations')) {
      return {
        title: 'Formations',
        subtitle: 'Découvrez des milliers de formations pour développer vos compétences',
      };
    }
    if (pathname.startsWith('/mes-lecons')) {
      return {
        title: 'Mes leçons',
        subtitle: 'Suivez votre progression et reprenez facilement votre apprentissage',
      };
    }
    if (pathname.startsWith('/quiz')) {
      return {
        title: 'Quiz',
        subtitle: 'Testez vos connaissances et grimpez dans le classement',
      };
    }
    if (pathname.startsWith('/mon-compte') || pathname.startsWith('/profil')) {
      return {
        title: 'Mon Compte',
        subtitle: 'Gérez vos données personnelles et vos accès',
      };
    }
    if (pathname.startsWith('/formateur')) {
      return {
        title: 'Espace Formateur',
        subtitle: 'Préparez vos futurs contenus pédagogiques',
      };
    }
    if (pathname.startsWith('/connexion')) {
      return {
        title: 'Connexion',
        subtitle: 'Accédez à votre espace d’apprentissage',
      };
    }
    if (pathname.startsWith('/inscription')) {
      return {
        title: 'Inscription',
        subtitle: 'Créez votre compte en quelques secondes',
      };
    }
    if (pathname.startsWith('/mot-de-passe-oublie')) {
      return {
        title: 'Mot de passe oublié',
        subtitle: 'Réinitialisez votre mot de passe en toute sécurité',
      };
    }
    return {
      title: 'SkillUp',
      subtitle: 'Plateforme mobile-first de formations en ligne',
    };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="w-full bg-[#F8F9FC] py-4 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left / Page Context & Greeting */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
          {subtitle}
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search bar (Desktop) */}
        <div className="hidden md:flex items-center relative w-72 lg:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher une formation..."
            className="w-full bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#5C4DF5] focus:ring-2 focus:ring-[#5C4DF5]/15 rounded-xl pl-9 pr-12 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none transition-all shadow-xs"
          />
          <span className="absolute right-2.5 bg-gray-100 border border-gray-200 text-gray-400 text-[10px] font-medium px-1.5 py-0.5 rounded">
            ⌘K
          </span>
        </div>

        {/* Notifications (Desktop) */}
        {user && (
          <button
            type="button"
            className="hidden sm:flex relative w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors shadow-xs cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-[#5C4DF5] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              3
            </span>
          </button>
        )}

        {/* Auth Section: Utilisateur connecté ou boutons de connexion */}
        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/mon-compte"
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-white transition-colors group cursor-pointer"
              title="Consulter mon compte"
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-200 relative bg-gray-100">
                  <Image
                    src={avatarUrl}
                    alt={displayName || 'Profil'}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
              </div>

              <div className="hidden lg:flex flex-col text-left leading-tight">
                <span className="text-sm font-semibold text-gray-800 group-hover:text-[#5C4DF5] transition-colors max-w-[120px] truncate">
                  {displayName}
                </span>
                <span className="text-[11px] font-medium text-[#5C4DF5]">
                  {userRoleLabel}
                </span>
              </div>
            </Link>

            {/* Bouton de déconnexion rapide */}
            <button
              type="button"
              onClick={() => signOut()}
              className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              href="/connexion"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#5C4DF5] bg-white border border-[#E5E7EB] hover:border-purple-200 px-3 sm:px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-gray-400" />
              <span>Connexion</span>
            </Link>
            <Link
              href="/inscription"
              className="inline-flex items-center text-xs sm:text-sm font-semibold text-white bg-[#5C4DF5] hover:bg-[#4B3CE0] px-3.5 sm:px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>S'inscrire</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
