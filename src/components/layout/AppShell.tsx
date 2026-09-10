'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopHeader } from './TopHeader';
import { useAuth } from '@/contexts/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Pages autonomes plein écran (Landing page et Authentification sans Sidebar ni TopHeader d'application)
  const isLandingPage = pathname === '/landing' || (pathname === '/' && !user);
  const isAuthPage =
    pathname.startsWith('/connexion') ||
    pathname.startsWith('/inscription') ||
    pathname.startsWith('/mot-de-passe-oublie') ||
    isLandingPage;

  // Routes protégées nécessitant impérativement une authentification en Phase 8B / 9B
  const isProtectedRoute =
    pathname.startsWith('/mon-compte') ||
    pathname.startsWith('/mes-lecons') ||
    pathname.startsWith('/formateur') ||
    pathname.startsWith('/abonnement');

  // Redirection propre vers /connexion uniquement si l'utilisateur tente d'accéder à une route protégée
  useEffect(() => {
    if (!isLoading && !user && isProtectedRoute) {
      router.replace(`/connexion?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, isProtectedRoute, pathname, router]);

  // 1. Pages d'authentification : Plein écran autonome, propre et épuré
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex flex-col justify-center text-gray-900">
        {children}
      </div>
    );
  }

  // 2. Si route protégée et utilisateur non connecté, afficher un état d'attente pendant la redirection
  if (isProtectedRoute && !user) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#5C4DF5] flex items-center justify-center text-white shadow-md shadow-indigo-200 animate-pulse">
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
          <span className="text-xs font-semibold text-gray-500 tracking-wide">
            Redirection vers la connexion...
          </span>
        </div>
      </div>
    );
  }

  // 3. Application standard (pages publiques et pages privées quand connecté)
  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col md:flex-row text-gray-900">
      {/* Desktop Sidebar (masquée sur mobile) */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Zone de contenu principale */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <TopHeader />
        <main className="flex-1 px-4 sm:px-8">
          {children}
        </main>
      </div>

      {/* Navigation basse mobile */}
      <BottomNav />
    </div>
  );
};
