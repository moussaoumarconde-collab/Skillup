'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Trophy, ChevronRight, ArrowRight } from 'lucide-react';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { RankingChart } from '@/components/ui/RankingChart';
import { currentUser } from '@/data/mockData';

export const PerformanceSection: React.FC = () => {
  return (
    <section className="w-full space-y-3">
      {/* Header row with "Voir tout >" */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
          Mes performances
        </h2>
        <Link
          href="/performances"
          className="text-xs font-semibold text-[#5C4DF5] hover:text-[#4B3CE0] flex items-center gap-0.5 transition-colors group"
        >
          <span>Voir tout</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Two Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Ma progression */}
        <div className="bg-white rounded-2xl p-5 border border-[#F0F2F6] hover:border-[#E2E8F0] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] flex items-center justify-center text-[#5C4DF5]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Ma progression</h3>
            </div>

            <div className="flex items-center justify-between sm:justify-around gap-4 px-1">
              <ProgressCircle percentage={currentUser.stats.overallProgress} size={92} strokeWidth={9} />

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Formations en cours</p>
                  <p className="text-xl font-extrabold text-gray-900 mt-0.5">
                    {currentUser.stats.coursesInProgressCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Leçons terminées</p>
                  <p className="text-xl font-extrabold text-gray-900 mt-0.5">
                    {currentUser.stats.completedLessonsCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100">
            <Link
              href="/mes-lecons"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C4DF5] hover:text-[#4B3CE0] group"
            >
              <span>Voir mes leçons</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Card 2: Mon classement */}
        <div className="bg-[#FFFDF7] rounded-2xl p-5 border border-[#FEF3C7] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-100/70 flex items-center justify-center text-amber-600">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Mon classement</h3>
            </div>

            <p className="text-xs text-gray-500">Vous êtes dans le</p>

            <div className="flex items-end justify-between gap-2 mt-1">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#D97706] tracking-tight">
                  {currentUser.stats.rankPercentile}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  des apprenants cette semaine
                </p>
              </div>

              <div className="shrink-0">
                <RankingChart />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-amber-100/60">
            <Link
              href="/quiz"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D97706] hover:text-[#B45309] group"
            >
              <span>Voir le classement</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
