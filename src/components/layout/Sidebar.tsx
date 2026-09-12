'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  PlaySquare,
  Trophy,
  Settings,
  HelpCircle,
  Crown,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { label: 'Accueil', href: '/', icon: Home },
  { label: 'Formations', href: '/formations', icon: BookOpen },
  { label: 'Mes leçons', href: '/mes-lecons', icon: PlaySquare },
  { label: 'Quiz', href: '/quiz', icon: Trophy },
];

const secondaryNavItems: NavItem[] = [
  { label: 'Paramètres', href: '/parametres', icon: Settings },
  { label: 'Aide & Support', href: '/support', icon: HelpCircle },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  const userRole = profile?.role || (user?.user_metadata?.role as string) || 'student';
  const isInstructor = userRole === 'instructor' || userRole === 'admin';

  const isItemActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-screen max-h-screen bg-white border-r border-[#F0F2F6] flex flex-col justify-between p-4 sm:p-5 select-none shrink-0 sticky top-0 overflow-y-auto">
      {/* Brand Header */}
      <div>
        <Link href="/" className="flex items-center gap-3 px-2 py-1 mb-4 group">
          <div className="w-9 h-9 rounded-xl bg-[#5C4DF5] flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
            {/* SkillUp geometric swirl logo */}
            <svg
              className="w-5 h-5 text-white"
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
          <span className="font-extrabold text-2xl text-gray-900 tracking-tight">
            Skill<span className="text-[#5C4DF5]">Up</span>
          </span>
        </Link>

        {/* Main Navigation */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const active = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#EDE9FE] text-[#5C4DF5] font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    active ? 'text-[#5C4DF5]' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Section: AUTRE */}
        <div className="mt-5">
          <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Autre
          </p>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const active = isItemActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#EDE9FE] text-[#5C4DF5] font-semibold'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-[#5C4DF5]' : 'text-gray-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Card: Espace Formateur (affiché uniquement pour les formateurs et admins) */}
      {isInstructor && (
        <div className="bg-gradient-to-b from-[#F8F7FF] to-[#F1EFFF] border border-[#ECEAFE] rounded-2xl p-3.5 text-left relative overflow-hidden mt-3 shrink-0 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100/80 flex items-center justify-center shrink-0">
                <Crown className="w-3.5 h-3.5 text-[#5C4DF5]" />
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">
                Espace Formateur
              </h4>
            </div>
            <Link
              href="/abonnement"
              prefetch={true}
              className="text-[11px] font-semibold text-[#5C4DF5] hover:underline"
              title="Consulter les formules et tarifs"
            >
              Tarifs
            </Link>
          </div>

          <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
            Gérez vos formations, consultez vos revenus et vos leçons.
          </p>

          <Link
            href="/formateur"
            prefetch={true}
            className={`w-full inline-flex items-center justify-center gap-1.5 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer ${
              pathname.startsWith('/formateur')
                ? 'bg-[#4B3CE0] ring-2 ring-[#5C4DF5]/30'
                : 'bg-[#5C4DF5] hover:bg-[#4B3CE0]'
            }`}
          >
            <span>Accéder à mon espace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </aside>
  );
};
