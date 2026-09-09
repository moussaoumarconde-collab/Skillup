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
} from 'lucide-react';

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

  const isItemActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-[#F0F2F6] flex flex-col justify-between p-5 select-none shrink-0 sticky top-0">
      {/* Brand Header */}
      <div>
        <Link href="/" className="flex items-center gap-3 px-2 py-1 mb-6 group">
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
        <div className="mt-7">
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

      {/* Card: Abonnement Formateur & Tarifs */}
      <div className="bg-[#F8F7FF] border border-[#ECEAFE] rounded-2xl p-4 text-left relative overflow-hidden mt-4">
        <div className="w-8 h-8 rounded-lg bg-purple-100/70 flex items-center justify-center mb-2.5">
          <Crown className="w-4 h-4 text-[#5C4DF5]" />
        </div>
        <h4 className="font-bold text-sm text-gray-900">Espace Formateur</h4>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Consultez nos formules d'abonnement pour publier vos cours.
        </p>
        <Link
          href="/abonnement"
          className="mt-3.5 w-full inline-flex items-center justify-center bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          Voir les tarifs
        </Link>
      </div>
    </aside>
  );
};
