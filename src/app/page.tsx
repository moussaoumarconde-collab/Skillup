import React from 'react';
import Link from 'next/link';
import { Compass, ChevronRight } from 'lucide-react';
import { FeaturedCarousel } from '@/components/home/FeaturedCarousel';
import { PerformanceSection } from '@/components/home/PerformanceSection';
import { ResumeLessonCard } from '@/components/home/ResumeLessonCard';

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 py-2 sm:py-4">
      {/* 1. & 2. & 3. & 4. EN VEDETTE + CARROUSEL + INDICATEURS */}
      <FeaturedCarousel />

      {/* 5. BOUTON EXPLORER (IMMÉDIATEMENT APRÈS LE CARROUSEL ET SES INDICATEURS) */}
      <div className="w-full">
        <Link
          href="/formations"
          className="w-full bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white py-3.5 sm:py-4 px-6 rounded-2xl font-semibold shadow-md shadow-indigo-100/60 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] group cursor-pointer"
        >
          <Compass className="w-5 h-5 text-white shrink-0 group-hover:rotate-45 transition-transform duration-300" />
          <span className="sm:hidden text-sm font-semibold tracking-wide">
            Explorer
          </span>
          <span className="hidden sm:inline text-base font-semibold tracking-wide">
            Explorer toutes les formations
          </span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 6. MES PERFORMANCES */}
      <PerformanceSection />

      {/* 7. REPRENDRE MA DERNIÈRE LEÇON */}
      <ResumeLessonCard />
    </div>
  );
}
