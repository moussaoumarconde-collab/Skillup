'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { InstructorSubscription } from '@/types';
import { getInstructorSubscription } from '@/lib/subscriptions';
import { SubscriptionStatus } from '@/components/subscriptions/SubscriptionStatus';
import { InstructorWalletDashboard } from '@/components/wallet/InstructorWalletDashboard';
import { InstructorCourseCard } from '@/components/instructor/InstructorCourseCard';
import { CreateCourseModal } from '@/components/instructor/CreateCourseModal';
import {
  GraduationCap,
  ShieldAlert,
  BookOpen,
  Sparkles,
  Plus,
  Loader2,
  ShoppingCart,
  Users,
  Coins,
  LayoutGrid,
} from 'lucide-react';
import type { DbCourse, InstructorCourseMetrics } from '@/types/course';

type CourseWithMetrics = DbCourse & { metrics: InstructorCourseMetrics };

export default function FormateurPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const [subscription, setSubscription] = useState<InstructorSubscription | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState<boolean>(true);

  // Formations
  const [courses, setCourses] = useState<CourseWithMetrics[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Charger le statut d'abonnement du formateur
  useEffect(() => {
    let isMounted = true;

    if (user?.id) {
      setIsCheckingSubscription(true);
      getInstructorSubscription(user.id)
        .then((sub) => {
          if (isMounted) {
            setSubscription(sub);
            setIsCheckingSubscription(false);
          }
        })
        .catch((err) => {
          console.error('[Formateur] Erreur chargement abonnement:', err);
          if (isMounted) {
            setSubscription(null);
            setIsCheckingSubscription(false);
          }
        });
    } else if (!isLoading && !user) {
      setIsCheckingSubscription(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id, isLoading, user]);

  // Charger les formations du formateur
  useEffect(() => {
    let isMounted = true;

    const loadCourses = async () => {
      setIsLoadingCourses(true);
      setCoursesError(null);

      try {
        const response = await fetch('/api/instructor/courses');
        const data = await response.json();

        if (!response.ok) {
          if (isMounted) {
            setCoursesError(data.error || 'Erreur lors du chargement.');
            setIsLoadingCourses(false);
          }
          return;
        }

        if (isMounted) {
          setCourses(data.courses || []);
          setIsLoadingCourses(false);
        }
      } catch (err) {
        console.error('[Formateur] Erreur chargement formations:', err);
        if (isMounted) {
          setCoursesError('Impossible de charger les formations.');
          setIsLoadingCourses(false);
        }
      }
    };

    if (user?.id) {
      loadCourses();
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Redirection si non connecté
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/connexion?redirect=/formateur');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="py-16 text-center text-xs sm:text-sm text-gray-400">
        Vérification des droits formateur...
      </div>
    );
  }

  const role = profile?.role || (user.user_metadata?.role as string) || 'student';
  const isInstructor = role === 'instructor' || role === 'admin';

  // 1. Si l'utilisateur est un Élève : ACCÈS REFUSÉ
  if (!isInstructor) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl border border-rose-100 p-8 sm:p-10 shadow-sm space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Accès réservé aux formateurs
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
              Votre compte est actuellement configuré avec le profil <strong>Élève</strong>. Cet espace est exclusivement réservé aux comptes <strong>Formateur</strong>.
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/formations"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explorer les formations</span>
            </Link>

            <Link
              href="/mon-compte"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <span>Mon compte</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Agrégation des métriques
  const totalFormations = courses.length;
  const totalStudents = courses.reduce((sum, c) => sum + c.metrics.students_count, 0);
  const totalSales = courses.reduce((sum, c) => sum + c.metrics.sales_count, 0);
  const totalRevenue = courses.reduce((sum, c) => sum + c.metrics.total_revenue, 0);

  const formatXOF = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  // 2. Si l'utilisateur est bien un Formateur : DASHBOARD
  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-6">

      {/* En-tête Formateur */}
      <div className="bg-white rounded-2xl border border-[#F0F2F6] p-5 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center shadow-sm shadow-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5C4DF5] bg-[#EDE9FE] px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Formateur vérifié</span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                Espace formateur
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle formation</span>
          </button>
        </div>

        {/* Abonnement */}
        <div className="mt-5 max-w-md">
          <SubscriptionStatus subscription={subscription} isLoading={isCheckingSubscription} />
        </div>
      </div>

      {/* Métriques globales */}
      {!isLoadingCourses && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-[#F0F2F6] p-4 text-center shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center mx-auto mb-2">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <p className="text-xl font-extrabold text-gray-900">{totalFormations}</p>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">Formations</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#F0F2F6] p-4 text-center shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xl font-extrabold text-gray-900">{totalStudents}</p>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">Étudiants</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#F0F2F6] p-4 text-center shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <p className="text-xl font-extrabold text-gray-900">{totalSales}</p>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">Ventes</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#F0F2F6] p-4 text-center shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <Coins className="w-4 h-4" />
            </div>
            <p className="text-xl font-extrabold text-gray-900">{formatXOF(totalRevenue)}</p>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">Revenus (XOF)</p>
          </div>
        </div>
      )}

      {/* Liste des formations */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-900 px-1">Mes formations</h2>

        {isLoadingCourses ? (
          <div className="bg-white rounded-2xl border border-[#F0F2F6] p-10 text-center shadow-sm">
            <Loader2 className="w-6 h-6 text-[#5C4DF5] animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Chargement de vos formations…</p>
          </div>
        ) : coursesError ? (
          <div className="bg-white rounded-2xl border border-red-100 p-6 text-center shadow-sm">
            <p className="text-xs text-red-600">{coursesError}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#F0F2F6] p-8 sm:p-10 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Aucune formation pour l&apos;instant</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
              Créez votre première formation et partagez votre expertise avec le monde.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une formation</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {courses.map((course) => (
              <InstructorCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* Portefeuille et reversements automatiques du formateur (Phase 9D) */}
      <InstructorWalletDashboard />

      {/* Modal de création */}
      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
