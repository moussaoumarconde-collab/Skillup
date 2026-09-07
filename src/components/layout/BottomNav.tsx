'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, PlaySquare, Trophy } from 'lucide-react';

interface BottomNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; fill?: string }>;
}

const bottomNavItems: BottomNavItem[] = [
  { label: 'Accueil', href: '/', icon: Home },
  { label: 'Formations', href: '/formations', icon: BookOpen },
  { label: 'Mes leçons', href: '/mes-lecons', icon: PlaySquare },
  { label: 'Quiz', href: '/quiz', icon: Trophy },
];

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F0F2F6] px-4 py-2 flex items-center justify-around md:hidden shadow-[0_-4px_25px_rgba(0,0,0,0.04)]">
      {bottomNavItems.map((item) => {
        const active = isItemActive(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              active ? 'text-[#5C4DF5]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  active ? 'scale-110' : 'scale-100'
                }`}
                fill={active ? '#5C4DF5' : 'none'}
              />
            </div>
            <span
              className={`text-[11px] mt-1 transition-all ${
                active ? 'font-semibold text-[#5C4DF5]' : 'font-medium text-gray-500'
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
