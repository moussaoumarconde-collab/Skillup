'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ShoppingCart, Coins, ChevronRight } from 'lucide-react';
import { CourseStatusBadge } from './CourseStatusBadge';
import type { DbCourse, InstructorCourseMetrics } from '@/types/course';

interface InstructorCourseCardProps {
  course: DbCourse & { metrics: InstructorCourseMetrics };
}

export const InstructorCourseCard: React.FC<InstructorCourseCardProps> = ({ course }) => {
  const { metrics } = course;

  const formatXOF = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' XOF';
  };

  return (
    <div className="bg-white rounded-2xl border border-[#F0F2F6] p-4 sm:p-5 hover:border-[#E2E8F0] hover:shadow-[0_4px_20px_-2px_rgba(92,77,245,0.05)] transition-all">
      {/* Header : titre + statut */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
            {course.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[11px] text-gray-500 font-medium">{course.category}</span>
            <span className="text-gray-300">·</span>
            <span className="text-[11px] text-gray-500 font-medium">{course.level}</span>
            <span className="text-gray-300">·</span>
            <span className={`text-[11px] font-semibold ${course.pricing_type === 'free' ? 'text-emerald-600' : 'text-[#5C4DF5]'}`}>
              {course.pricing_type === 'free' ? 'Gratuite' : formatXOF(course.price)}
            </span>
          </div>
        </div>
        <CourseStatusBadge status={course.status} />
      </div>

      {/* Métriques inline */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <ShoppingCart className="w-3 h-3 text-gray-400" />
          </div>
          <p className="text-sm font-bold text-gray-900">{metrics.sales_count}</p>
          <p className="text-[10px] text-gray-500">Ventes</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Users className="w-3 h-3 text-gray-400" />
          </div>
          <p className="text-sm font-bold text-gray-900">{metrics.students_count}</p>
          <p className="text-[10px] text-gray-500">Étudiants</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Coins className="w-3 h-3 text-gray-400" />
          </div>
          <p className="text-sm font-bold text-gray-900">{formatXOF(metrics.total_revenue)}</p>
          <p className="text-[10px] text-gray-500">Revenus</p>
        </div>
      </div>

      {/* Bouton gérer */}
      <Link
        href={`/formateur/formations/${course.id}`}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
      >
        <span>Gérer cette formation</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
