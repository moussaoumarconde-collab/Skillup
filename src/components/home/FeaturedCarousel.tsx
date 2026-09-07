'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Play,
  Clock,
  Flame,
  Heart,
  Loader2,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { fetchPublishedCourses } from '@/lib/courses/catalog';
import { Course } from '@/types';

const GRADIENTS = [
  'bg-gradient-to-r from-[#6252F7] via-[#5443EB] to-[#4332DD]',
  'bg-gradient-to-br from-[#7C6FF6] via-[#6857EB] to-[#513FE0]',
  'bg-gradient-to-br from-[#0D9488] via-[#0F766E] to-[#115E59]',
  'bg-gradient-to-br from-[#4F46E5] via-[#4338CA] to-[#3730A3]',
  'bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9]',
];

const AUTO_PLAY_MS = 5000;

export const FeaturedCarousel: React.FC = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isSwiping = useRef<boolean>(false);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchPublishedCourses();
      setCourses(data);
      // Si au moins 3 formations, on centre la deuxième pour le confort visuel initial, sinon la première
      if (data.length >= 3) {
        setCurrentIndex(1);
      } else {
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('[FeaturedCarousel] Erreur récupération Supabase:', err);
      setErrorMessage('Impossible de charger les formations en vedette.');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const total = courses.length;

  // Navigation helpers with modular wrapping
  const goNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play: starts/restarts on mount and after any manual interaction
  const startAutoPlay = useCallback(() => {
    if (total <= 1) return;
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(goNext, AUTO_PLAY_MS);
  }, [goNext, total]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  // Manual interaction wrappers that reset the auto-play timer
  const onManualNext = useCallback(() => {
    goNext();
    startAutoPlay();
  }, [goNext, startAutoPlay]);

  const onManualPrev = useCallback(() => {
    goPrev();
    startAutoPlay();
  }, [goPrev, startAutoPlay]);

  const onManualGoTo = useCallback((index: number) => {
    goTo(index);
    startAutoPlay();
  }, [goTo, startAutoPlay]);

  // Start auto-play when data arrives, clean up on unmount
  useEffect(() => {
    if (total > 1) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay, total]);

  // Pause auto-play when tab is not visible to avoid queued transitions
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        stopAutoPlay();
      } else if (total > 1) {
        startAutoPlay();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [startAutoPlay, stopAutoPlay, total]);

  // Touch handlers for mobile swipe vs tap
  const handleTouchStart = (e: React.TouchEvent) => {
    if (total <= 1) return;
    isSwiping.current = false;
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (total <= 1) return;
    touchEndX.current = e.targetTouches[0].clientX;
    if (touchStartX.current !== null && Math.abs(touchStartX.current - touchEndX.current) > 10) {
      isSwiping.current = true;
    }
  };
  const handleTouchEnd = () => {
    if (total <= 1) return;
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) onManualNext();
    else if (distance < -45) onManualPrev();
    touchStartX.current = null;
    touchEndX.current = null;
    setTimeout(() => {
      isSwiping.current = false;
    }, 150);
  };

  // Keyboard navigation
  useEffect(() => {
    if (total <= 1) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onManualPrev();
      if (e.key === 'ArrowRight') onManualNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onManualPrev, onManualNext, total]);

  // Compute each slide's position relative to the current center
  const getOffset = (index: number): number => {
    if (total <= 1) return 0;
    let diff = index - currentIndex;
    if (diff > Math.floor(total / 2)) diff -= total;
    if (diff < -Math.floor(total / 2)) diff += total;
    return diff;
  };

  return (
    <section className="w-full select-none">
      {/* Titre « ⭐ En vedette » au-dessus du carrousel */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <Star className="w-5 h-5 text-[#5C4DF5] fill-[#5C4DF5]" />
        <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
          En vedette
        </h2>
      </div>

      {/* 1. ÉTAT DE CHARGEMENT */}
      {isLoading ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#5C4DF5] flex items-center justify-center mx-auto animate-spin">
            <Loader2 className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-500">
            Chargement des formations en vedette...
          </p>
        </div>
      ) : errorMessage ? (
        /* 2. ÉTAT D'ERREUR AVEC BOUTON RÉESSAYER */
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center border border-rose-100 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={loadCourses}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#5C4DF5] bg-[#EDE9FE] hover:bg-[#E0DCFE] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      ) : total === 0 ? (
        /* 3. ÉTAT VIDE GLOBAL (0 formation publiée dans Supabase) */
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5C4DF5] flex items-center justify-center mx-auto mb-1">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
            Aucune formation en vedette pour le moment
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Les nouvelles formations publiées apparaîtront directement ici. Explorez le catalogue pour découvrir les cours à venir !
          </p>
        </div>
      ) : (
        /* 4. ZONE DU CARROUSEL AVEC FORMATIONS RÉELLES SUPABASE */
        <>
          <div
            className="relative w-full overflow-hidden py-2"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Flèches Desktop si plusieurs formations */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={onManualPrev}
                  aria-label="Formation précédente"
                  className="hidden md:flex absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-lg border border-gray-100 items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={onManualNext}
                  aria-label="Formation suivante"
                  className="hidden md:flex absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-lg border border-gray-100 items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Scène du carrousel — positionnement absolu des cartes rectangulaires */}
            <div className="relative h-[220px] sm:h-[260px] md:h-[290px] w-full flex items-center justify-center">
              {courses.map((course, index) => {
                const offset = getOffset(index);
                const isCenter = offset === 0;
                const isLeft = offset === -1;
                const isRight = offset === 1;
                const isVisible = total === 1 ? true : isCenter || isLeft || isRight;

                let translateX = '0%';
                let scale = 0.82;
                let opacity = 0;
                let zIndex = 0;

                if (isCenter) {
                  translateX = '0%';
                  scale = 1;
                  opacity = 1;
                  zIndex = 20;
                } else if (isLeft) {
                  translateX = '-72%';
                  scale = 0.88;
                  opacity = 0.75;
                  zIndex = 10;
                } else if (isRight) {
                  translateX = '72%';
                  scale = 0.88;
                  opacity = 0.75;
                  zIndex = 10;
                }

                const bgGradient = GRADIENTS[index % GRADIENTS.length];
                const modulesCount = course.modulesCount || course.modules?.length || 0;
                const lessonsCount = course.lessonsCount || 0;
                const duration = course.duration || 'Flexible';
                const statusLabel =
                  course.status === 'Gratuite'
                    ? 'Gratuite'
                    : course.price
                    ? `${course.price.toLocaleString('fr-FR')} FCFA`
                    : 'Payante';

                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      if (isSwiping.current) return;
                      if (isVisible) {
                        router.push(`/formations/${course.id}`);
                      }
                    }}
                    style={{
                      transform: `translateX(${translateX}) scale(${scale})`,
                      opacity,
                      zIndex,
                      transition:
                        'transform 600ms cubic-bezier(0.25, 1, 0.5, 1), opacity 600ms cubic-bezier(0.25, 1, 0.5, 1)',
                      pointerEvents: isVisible ? 'auto' : 'none',
                    }}
                    className={`absolute w-[86%] sm:w-[78%] md:w-[70%] max-w-[740px] h-full rounded-2xl sm:rounded-3xl overflow-hidden flex items-center text-white ${bgGradient} ${
                      isCenter
                        ? 'shadow-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                        : isVisible
                        ? 'cursor-pointer hover:opacity-90 active:scale-[0.98]'
                        : ''
                    }`}
                  >
                    {/* Contenu textuel gauche */}
                    <div className="flex-1 p-4 sm:p-7 md:p-8 flex flex-col justify-between h-full z-10 min-w-0 pr-2 sm:pr-4">
                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        {course.isPopular ? (
                          <span className="bg-white text-gray-900 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                            Populaire
                          </span>
                        ) : (
                          <span className="bg-white/20 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full">
                            {course.level || 'Tous niveaux'}
                          </span>
                        )}
                        <span className="bg-white/20 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-300 fill-rose-300" />
                          {statusLabel}
                        </span>
                      </div>

                      {/* Titre & Description */}
                      <div className="my-auto py-1">
                        <h3 className="font-extrabold text-lg sm:text-2xl md:text-3xl text-white tracking-tight leading-tight truncate">
                          {course.title}
                        </h3>
                        {course.subtitle && (
                          <p className="text-xs sm:text-sm font-medium text-white/80 mt-0.5 sm:mt-1 truncate">
                            {course.subtitle}
                          </p>
                        )}
                        <p className="text-[11px] sm:text-xs md:text-sm text-white/90 mt-2 line-clamp-2 max-w-sm leading-relaxed hidden sm:block">
                          {course.description}
                        </p>
                      </div>

                      {/* Métadonnées */}
                      <div className="flex items-center gap-3 sm:gap-4 md:gap-5 text-[11px] sm:text-xs text-white/95 font-medium pt-1">
                        {modulesCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-white/80" />
                            <span>{modulesCount} Modules</span>
                          </div>
                        )}
                        {lessonsCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Play className="w-3.5 h-3.5 text-white/80" />
                            <span>{lessonsCount} Leçons</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-white/80" />
                          <span>{duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Illustration à droite */}
                    {course.thumbnail && (
                      <div className="relative w-2/5 sm:w-1/2 h-full shrink-0 overflow-hidden hidden xs:block">
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover object-center transform scale-105"
                          sizes="(max-width: 640px) 40vw, 360px"
                          priority={isCenter}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Indicateurs de pagination si plusieurs formations */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-2 mt-3 mb-4">
              {courses.map((_, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={index}
                    onClick={() => onManualGoTo(index)}
                    aria-label={`Aller à la formation ${index + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      isActive
                        ? 'w-7 h-2 bg-[#5C4DF5]'
                        : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
};
