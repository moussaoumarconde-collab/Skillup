'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Clock,
  Play,
  Briefcase,
  Star,
  CheckCircle2,
  Sparkles,
  User,
  Lock,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Course } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface CourseDetailHeroProps {
  course: Course;
}

export const CourseDetailHero: React.FC<CourseDetailHeroProps> = ({ course }) => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(course.status === 'Gratuite' || !course.price);
  const [checkingAccess, setCheckingAccess] = useState<boolean>(course.status !== 'Gratuite' && !!course.price);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);

  const isFree = course.status === 'Gratuite' || !course.price || course.price === 0;

  // Vérification de l'accès si la formation est payante
  useEffect(() => {
    let isMounted = true;
    if (!isFree && user?.id) {
      fetch(`/api/courses/purchase/access?course_id=${encodeURIComponent(course.id)}`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.hasAccess) {
            setHasAccess(true);
          }
        })
        .catch((err) => console.warn('Erreur vérification accès formation:', err))
        .finally(() => {
          if (isMounted) setCheckingAccess(false);
        });
    } else {
      setCheckingAccess(false);
    }
    return () => {
      isMounted = false;
    };
  }, [course.id, isFree, user?.id]);

  const handleStartCourse = () => {
    const firstLesson = course.modules?.[0]?.lessons?.[0];
    if (firstLesson) {
      setToastMessage(`Démarrage de la leçon : ${firstLesson.title}`);
    } else {
      setToastMessage(`Accès à la formation « ${course.title} »`);
    }
    setTimeout(() => setToastMessage(null), 3500);

    const curriculumEl = document.getElementById('curriculum-section');
    if (curriculumEl) {
      curriculumEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBuyCourse = async () => {
    if (!user) {
      router.push(`/connexion?redirect=/formations/${course.id}`);
      return;
    }

    setIsPurchasing(true);
    try {
      const res = await fetch('/api/courses/purchase/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToastMessage(data.error || 'Erreur lors de l’initialisation de l’achat.');
        setTimeout(() => setToastMessage(null), 4000);
        setIsPurchasing(false);
        return;
      }

      if (data.alreadyOwned || data.free) {
        setHasAccess(true);
        setToastMessage(data.message || 'Vous avez désormais accès à cette formation !');
        setTimeout(() => setToastMessage(null), 4000);
        setIsPurchasing(false);
        return;
      }

      if (data.checkoutUrl) {
        // Redirection vers le paiement sécurisé FedaPay
        window.location.href = data.checkoutUrl;
      } else {
        setToastMessage('Lien de paiement non généré.');
        setTimeout(() => setToastMessage(null), 4000);
        setIsPurchasing(false);
      }
    } catch (err) {
      console.error('Erreur achat formation:', err);
      setToastMessage('Erreur de connexion au serveur de paiement.');
      setTimeout(() => setToastMessage(null), 4000);
      setIsPurchasing(false);
    }
  };

  const statusLabel = isFree
    ? 'Gratuite'
    : hasAccess
    ? 'Accès débloqué'
    : course.price
    ? `Payante • ${course.price.toLocaleString('fr-FR')} FCFA`
    : 'Payante';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bouton retour vers le catalogue */}
      <div>
        <Link
          href="/formations"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#5C4DF5] transition-colors py-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Toutes les formations</span>
        </Link>
      </div>

      {/* Bannière Rectangulaire Horizontale (STRICTEMENT RECTANGULAIRE) */}
      <div className="relative w-full h-52 sm:h-72 md:h-80 rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-900 shadow-lg">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        ) : (
          <div
            className={`w-full h-full ${
              course.thumbnailBgColor || 'bg-gradient-to-r from-indigo-700 to-purple-800'
            } flex items-center justify-center text-white text-3xl font-extrabold`}
          >
            {course.title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        {/* Overlay Badges sur la bannière */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-end justify-between gap-3 text-white">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {course.isPopular && (
                <Badge variant="popular" className="text-xs px-2.5 py-0.5">
                  Populaire
                </Badge>
              )}
              <Badge
                variant={isFree || hasAccess ? 'free' : 'paid'}
                className="text-xs px-2.5 py-0.5"
              >
                {statusLabel}
              </Badge>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {course.level}
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              {course.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Fiche d'informations détaillée sous la bannière */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-7 md:p-8 shadow-xs space-y-6">
        {/* Ligne Formateur & Évaluation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-purple-50 text-[#5C4DF5] font-bold text-sm flex items-center justify-center border border-purple-100 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Formateur</p>
              <h4 className="text-sm sm:text-base font-bold text-gray-900">
                {course.instructor.name}
              </h4>
              {course.instructor.role && (
                <p className="text-xs text-gray-500">{course.instructor.role}</p>
              )}
            </div>
          </div>

          {/* Note & Popularité */}
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            {course.rating && (
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl font-bold">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{course.rating}</span>
                <span className="text-gray-400 font-normal">({course.likesCount || '1.2K'} avis)</span>
              </div>
            )}
            <div className="text-gray-500">
              <span className="font-semibold text-gray-900">{course.downloadsCount || 1200}</span> apprenants
            </div>
          </div>
        </div>

        {/* Métadonnées rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#5C4DF5]" />
            <div>
              <p className="text-[11px] text-gray-400">Durée totale</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900">{course.duration}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <Play className="w-4 h-4 text-[#5C4DF5]" />
            <div>
              <p className="text-[11px] text-gray-400">Nombre de leçons</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900">{course.lessonsCount} leçons</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-[#5C4DF5]" />
            <div>
              <p className="text-[11px] text-gray-400">Modules</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900">{course.modulesCount || 4} modules</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#5C4DF5]" />
            <div>
              <p className="text-[11px] text-gray-400">Niveau requis</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900">{course.level}</p>
            </div>
          </div>
        </div>

        {/* Description de la formation */}
        <div className="space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-gray-900">
            À propos de cette formation
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {course.description} Cette formation complète a été conçue pour vous apporter des compétences concrètes et directement applicables. Vous progresserez pas à pas à travers des modules structurés et des leçons claires pour maîtriser chaque concept.
          </p>
        </div>

        {/* Boutons d'action sécurisés */}
        <div className="pt-2">
          {checkingAccess ? (
            <div className="py-3 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#5C4DF5]" />
              <span>Vérification de vos accès...</span>
            </div>
          ) : isFree || hasAccess ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleStartCourse}
                className="flex-1 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-sm font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-200/50 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{hasAccess && !isFree ? 'Accéder à votre formation' : 'Commencer la formation'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleBuyCourse}
                disabled={isPurchasing}
                className="w-full bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-sm font-bold py-4 px-6 rounded-xl transition-all shadow-md shadow-indigo-200/50 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Préparation du paiement sécurisé...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      Acheter cette formation • {course.price?.toLocaleString('fr-FR')} FCFA
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Paiement sécurisé via FedaPay (MTN, Moov, Wave, Orange) • Accès instantané</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
