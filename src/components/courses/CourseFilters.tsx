'use client';

import React, { useState } from 'react';
import {
  LayoutGrid,
  Flame,
  Gift,
  BarChart,
  BarChart2,
  TrendingUp,
  ChevronDown,
  List,
} from 'lucide-react';

export type FilterType =
  | 'Tous'
  | 'Populaires'
  | 'Gratuites'
  | 'Débutant'
  | 'Intermédiaire'
  | 'Avancé';

export type SortType = 'Populaires' | 'Plus récents' | 'Durée';

interface CourseFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
}

const filters: { label: FilterType; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'Tous', icon: LayoutGrid },
  { label: 'Populaires', icon: Flame },
  { label: 'Gratuites', icon: Gift },
  { label: 'Débutant', icon: BarChart },
  { label: 'Intermédiaire', icon: BarChart2 },
  { label: 'Avancé', icon: TrendingUp },
];

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 select-none">
      {/* Horizontal Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {filters.map((f) => {
          const isActive = activeFilter === f.label;
          const Icon = f.icon;

          return (
            <button
              key={f.label}
              type="button"
              onClick={() => onFilterChange(f.label)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#5C4DF5] text-white shadow-xs font-semibold'
                  : 'bg-white hover:bg-gray-50 border border-gray-200/80 text-gray-700'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`}
              />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Sorting & View Mode Controls */}
      <div className="hidden sm:flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
        {/* Sort Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="bg-white border border-gray-200/80 hover:border-gray-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span className="text-gray-400 font-normal">Trier par :</span>
            <span className="text-gray-900 font-semibold">{sortBy}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-30">
              {(['Populaires', 'Plus récents', 'Durée'] as SortType[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onSortChange(option);
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${
                    sortBy === option
                      ? 'bg-purple-50 text-[#5C4DF5] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Toggle Icon */}
        <button
          type="button"
          className="w-9 h-9 bg-white border border-gray-200/80 rounded-xl flex items-center justify-center text-gray-600 shadow-xs hover:border-gray-300 transition-colors cursor-pointer"
          title="Mode liste"
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
