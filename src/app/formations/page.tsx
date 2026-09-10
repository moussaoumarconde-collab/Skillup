'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Sparkles, CheckCircle2, BookOpen, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { fetchPublishedCourses, getCachedPublishedCourses } from '@/lib/courses/catalog';
import { Course } from '@/types';
import { CourseCard } from '@/components/ui/CourseCard';
import { CourseFilters, FilterType, SortType } from '@/components/courses/CourseFilters';
import { Pagination } from '@/components/courses/Pagination';

function FormationsContent() {
  const searchParams = useSearchParams();
  const selectedCourseId = searchParams.get('selected');

  // Affichage instantané en 0ms si le cache mémoire est disponible
  const [courses, setCourses] = useState<Course[]>(() => getCachedPublishedCourses() || []);
  const [isLoading, setIsLoading] = useState<boolean>(() => !getCachedPublishedCourses());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('Tous');
  const [sortBy, setSortBy] = useState<SortType>('Populaires');
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Chargement des formations publiées depuis Supabase (silencieux si déjà en cache)
  const loadCourses = useCallback(async (force = false) => {
    const cached = getCachedPublishedCourses();
    if (!cached || force) {
      setIsLoading(true);
    }
    setErrorMessage(null);
    try {
      const data = await fetchPublishedCourses(undefined, force);
      setCourses(data);
    } catch (err) {
      console.error('[FormationsPage] Erreur récupération Supabase:', err);
      if (!cached) {
        setErrorMessage('Une erreur est survenue lors du chargement des formations.');
        setCourses([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Auto-scroll to top when a formation is selected
  useEffect(() => {
    if (selectedCourseId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedCourseId]);

  // Filter and sort the courses list dynamically
  const filteredCourses = useMemo(() => {
    let list = [...courses];

    // Priority ordering if a formation was selected from the carousel
    if (selectedCourseId) {
      const selectedIndex = list.findIndex((c) => c.id === selectedCourseId);
      if (selectedIndex !== -1) {
        const [selectedCourse] = list.splice(selectedIndex, 1);
        list = [selectedCourse, ...list];
      }
    } else {
      // Default catalogue order when arriving directly
      if (sortBy === 'Populaires') {
        list.sort((a, b) => {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return (b.downloadsCount || 0) - (a.downloadsCount || 0);
        });
      }
    }

    // Specific sorting if explicitly requested
    if (sortBy === 'Durée') {
      list.sort((a, b) => (a.duration || '').localeCompare(b.duration || ''));
    }

    // Apply activeFilter and search query
    return list.filter((course) => {
      // 1. Filter by category/status/level
      if (activeFilter === 'Populaires') {
        if (!course.isPopular) return false;
      } else if (activeFilter === 'Gratuites') {
        if (course.status !== 'Gratuite') return false;
      } else if (
        activeFilter === 'Débutant' ||
        activeFilter === 'Intermédiaire' ||
        activeFilter === 'Avancé'
      ) {
        if (course.level !== activeFilter) return false;
      }

      // 2. Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = course.title.toLowerCase().includes(query);
        const matchDesc = course.description.toLowerCase().includes(query);
        const matchCategory = course.category.toLowerCase().includes(query);
        const matchInstructor = course.instructor.name.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchCategory && !matchInstructor) {
          return false;
        }
      }

      return true;
    });
  }, [courses, selectedCourseId, activeFilter, searchQuery, sortBy]);

  // Handle course download click
  const handleDownload = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setDownloadToast(`Téléchargement de « ${course.title} » démarré`);
      setTimeout(() => setDownloadToast(null), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 py-2 sm:py-4">
      {/* Toast Notification for Downloads */}
      {downloadToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* 1. BARRE DE RECHERCHE MOBILE / DÉDIÉE */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une formation..."
          className="w-full bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#5C4DF5] focus:ring-2 focus:ring-[#5C4DF5]/15 rounded-2xl pl-10 pr-10 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. FILTRES HORIZONTAUX & CONTRÔLE DE TRI DESKTOP */}
      <CourseFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* 3. LISTE DES FORMATIONS OU ÉTATS (CHARGEMENT, ERREUR, VIDE) */}
      <div className="space-y-3.5 sm:space-y-4 pt-1">
        {isLoading ? (
          // État de chargement propre et élégant
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5C4DF5] flex items-center justify-center mx-auto animate-spin">
              <Loader2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Chargement du catalogue...</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
              Récupération des formations disponibles depuis la plateforme.
            </p>
          </div>
        ) : errorMessage ? (
          // État d'erreur avec option de réessai
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-rose-100 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Impossible de charger les formations</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => loadCourses(true)}
              className="inline-flex items-center gap-2 mt-2 text-xs font-semibold text-[#5C4DF5] bg-[#EDE9FE] hover:bg-[#E0DCFE] px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réessayer</span>
            </button>
          </div>
        ) : courses.length === 0 ? (
          // État vide global (0 formation publiée dans Supabase)
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-14 text-center border border-gray-100 shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#5C4DF5] flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg">
              Aucune formation disponible pour le moment
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              De nouvelles formations seront très prochainement publiées par nos formateurs. Revenez bientôt pour découvrir les nouveaux cours !
            </p>
          </div>
        ) : filteredCourses.length > 0 ? (
          // Affichage des formations filtrées
          filteredCourses.map((course, index) => {
            const isHighlighted = Boolean(
              selectedCourseId && course.id === selectedCourseId && index === 0
            );

            return (
              <CourseCard
                key={course.id}
                course={course}
                isHighlighted={isHighlighted}
                onDownload={handleDownload}
              />
            );
          })
        ) : (
          // Aucun résultat correspondant au filtre/recherche actif
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5C4DF5] flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Aucune formation trouvée</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
              Aucun résultat pour « {searchQuery || activeFilter} ». Essayez un autre filtre ou mot-clé.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('Tous');
              }}
              className="mt-3 text-xs font-semibold text-[#5C4DF5] bg-[#EDE9FE] hover:bg-[#E0DCFE] px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* 4. PAGINATION DESKTOP (uniquement si des formations sont affichées) */}
      {!isLoading && !errorMessage && filteredCourses.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={15}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

export default function FormationsPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto py-8 text-center text-gray-400 text-sm">Chargement du catalogue...</div>}>
      <FormationsContent />
    </Suspense>
  );
}
