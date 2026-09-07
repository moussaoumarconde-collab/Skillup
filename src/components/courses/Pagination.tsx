'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage = 1,
  totalPages = 15,
  onPageChange,
  className = '',
}) => {
  return (
    <div className={`hidden sm:flex items-center justify-center gap-1.5 pt-4 pb-2 select-none ${className}`}>
      {/* Prev Button */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange && onPageChange(currentPage - 1)}
        className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors disabled:opacity-40 disabled:pointer-events-none shadow-xs cursor-pointer"
        aria-label="Page précédente"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page 1 (Active) */}
      <button
        type="button"
        onClick={() => onPageChange && onPageChange(1)}
        className={`w-9 h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
          currentPage === 1
            ? 'bg-[#5C4DF5] text-white shadow-xs'
            : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
        }`}
      >
        1
      </button>

      {/* Page 2 */}
      <button
        type="button"
        onClick={() => onPageChange && onPageChange(2)}
        className={`w-9 h-9 rounded-xl text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${
          currentPage === 2
            ? 'bg-[#5C4DF5] text-white shadow-xs'
            : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
        }`}
      >
        2
      </button>

      {/* Page 3 */}
      <button
        type="button"
        onClick={() => onPageChange && onPageChange(3)}
        className={`w-9 h-9 rounded-xl text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${
          currentPage === 3
            ? 'bg-[#5C4DF5] text-white shadow-xs'
            : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
        }`}
      >
        3
      </button>

      {/* Ellipsis */}
      <span className="px-1 text-gray-400 text-xs font-medium">...</span>

      {/* Page 15 */}
      <button
        type="button"
        onClick={() => onPageChange && onPageChange(15)}
        className={`w-9 h-9 rounded-xl text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${
          currentPage === 15
            ? 'bg-[#5C4DF5] text-white shadow-xs'
            : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
        }`}
      >
        15
      </button>

      {/* Next Button */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange && onPageChange(currentPage + 1)}
        className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors disabled:opacity-40 disabled:pointer-events-none shadow-xs cursor-pointer"
        aria-label="Page suivante"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
