'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPublishedCourseById } from '@/lib/courses/catalog';
import { Course } from '@/types';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

function CoursePurchaseSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const transactionId = searchParams.get('transaction_id') || searchParams.get('id');
  const courseIdParam = searchParams.get('course_id') || '';

  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [verified, setVerified] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('verifying');
  const [message, setMessage] = useState<string>('Vérification sécurisée du paiement en cours...');
  const [courseId, setCourseId] = useState<string>(courseIdParam);
  const [matchedCourse, setMatchedCourse] = useState<Course | null>(null);

  const activeCourseId = courseId || courseIdParam;

  useEffect(() => {
    if (activeCourseId) {
      fetchPublishedCourseById(activeCourseId)
        .then((data) => setMatchedCourse(data))
        .catch(() => setMatchedCourse(null));
    }
  }, [activeCourseId]);

  const verifyPayment = async () => {
    if (!transactionId) {
      setIsVerifying(false);
      setStatus('error');
      setMessage('Identifiant de transaction manquant.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(
        `/api/courses/purchase/verify?transaction_id=${encodeURIComponent(
          transactionId
        )}&course_id=${encodeURIComponent(courseIdParam)}`
      );
      const data = await res.json();

      if (res.ok && data.verified && data.accessGranted) {
        setVerified(true);
        setStatus('approved');
        setMessage(
          data.message ||
            'Votre paiement a été confirmé. Vous avez maintenant un accès complet à cette formation !'
        );
        if (data.courseId) setCourseId(data.courseId);
      } else if (data.status === 'pending') {
        setStatus('pending');
        setMessage(
          data.message ||
            'Votre paiement est en cours de validation par votre opérateur Mobile Money.'
        );
      } else {
        setStatus('failed');
        setMessage(
          data.message ||
            'La transaction n a pas pu être confirmée. Aucun accès n a été accordé.'
        );
      }
    } catch (err) {
      console.error('Erreur vérification achat:', err);
      setStatus('error');
      setMessage('Erreur de connexion lors de la vérification du paiement auprès du serveur.');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      verifyPayment();
    } else if (!authLoading && !user) {
      router.replace('/connexion?redirect=/formations');
    }
  }, [authLoading, user, transactionId]);

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-16 px-4">
      <div className="bg-white rounded-3xl border border-[#F0F2F6] p-6 sm:p-10 shadow-sm text-center space-y-6">
        {/* ÉTAT : EN COURS DE VÉRIFICATION */}
        {isVerifying && (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#5C4DF5] flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Vérification du paiement
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                {message}
              </p>
            </div>
          </div>
        )}

        {/* ÉTAT : CONFIRMÉ / APPROUVÉ */}
        {!isVerifying && verified && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm shadow-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Paiement sécurisé FedaPay validé</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Accès débloqué !
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                {message}
              </p>
            </div>

            {/* Récapitulatif de la formation */}
            {matchedCourse && (
              <div className="bg-[#F8F9FC] border border-gray-100 rounded-2xl p-4 text-left flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-[#5C4DF5] flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-gray-900 truncate">
                    {matchedCourse.title}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {matchedCourse.instructor.name} • {matchedCourse.lessonsCount} leçons
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/formations/${courseId || courseIdParam}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer"
              >
                <span>Accéder à la formation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/formations"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold px-5 py-3.5 rounded-xl transition-all cursor-pointer"
              >
                <span>Catalogue des formations</span>
              </Link>
            </div>
          </div>
        )}

        {/* ÉTAT : PAIEMENT EN ATTENTE (PENDING) */}
        {!isVerifying && !verified && status === 'pending' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Paiement en cours de traitement
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                {message}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={verifyPayment}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualiser le statut</span>
              </button>
              <Link
                href="/formations"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl transition-all cursor-pointer"
              >
                <span>Retour aux formations</span>
              </Link>
            </div>
          </div>
        )}

        {/* ÉTAT : ÉCHEC OU ERREUR */}
        {!isVerifying && !verified && status !== 'pending' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Paiement non confirmé
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                {message}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={verifyPayment}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Réessayer la vérification</span>
              </button>
              <Link
                href={`/formations/${courseId || courseIdParam}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition-all cursor-pointer"
              >
                <span>Retour à la formation</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursePurchaseSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto py-16 px-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-[#5C4DF5]" />
            <span>Chargement...</span>
          </div>
        </div>
      }
    >
      <CoursePurchaseSuccessContent />
    </Suspense>
  );
}
