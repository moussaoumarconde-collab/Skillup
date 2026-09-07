'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { InstructorSubscription, SubscriptionPlan } from '@/types';
import { getInstructorSubscription, isSubscriptionActive } from '@/lib/subscriptions';
import { SUBSCRIPTION_PLANS, formatPlanPrice } from '@/lib/subscriptions/plans';
import { SubscriptionStatus } from '@/components/subscriptions/SubscriptionStatus';
import {
  Sparkles,
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Lock,
  Layers,
  Award,
} from 'lucide-react';

export default function AbonnementPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const [subscription, setSubscription] = useState<InstructorSubscription | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState<boolean>(true);
  const [processingPlan, setProcessingPlan] = useState<SubscriptionPlan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirection si non connecté
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/connexion?redirect=/abonnement');
    }
  }, [user, isLoading, router]);

  // Redirection immédiate si l'utilisateur est un Élève (l'élève n'a aucun abonnement formateur)
  useEffect(() => {
    if (!isLoading && user) {
      const role = profile?.role || (user.user_metadata?.role as string) || 'student';
      if (role === 'student') {
        router.replace('/mon-compte');
      }
    }
  }, [user, profile, isLoading, router]);

  // Charger et vérifier l'état réel de l'abonnement dès l'ouverture
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
          console.error('[Abonnement] Erreur chargement statut:', err);
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

  const handleSubscribe = async (planId: SubscriptionPlan) => {
    setErrorMessage(null);
    setProcessingPlan(planId);

    try {
      const response = await fetch('/api/payments/fedapay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'initialisation du paiement.');
      }

      if (data.checkoutUrl) {
        // Redirection vers l'interface sécurisée de paiement FedaPay
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('URL de paiement non fournie par le serveur.');
      }
    } catch (err) {
      console.error('Erreur souscription:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Une erreur inattendue est survenue.'
      );
      setProcessingPlan(null);
    }
  };

  // =========================================================================
  // ÉTAT 1 : CHARGEMENT ET VÉRIFICATION INITIALE (ANTI-FLASH)
  // Aucun état "non abonné" ni formulaire de paiement n'est affiché ici.
  // =========================================================================
  if (isLoading || !user || isCheckingSubscription) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 flex flex-col items-center justify-center space-y-4 min-h-[50vh]">
        <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm sm:text-base font-bold text-gray-800">
            Vérification de votre abonnement…
          </h2>
          <p className="text-xs text-gray-400">
            Récupération de vos droits formateur en cours
          </p>
        </div>
      </div>
    );
  }

  const role = profile?.role || (user.user_metadata?.role as string) || 'student';
  if (role === 'student') {
    return null; // En cours de redirection vers /mon-compte
  }

  const hasActiveSub = isSubscriptionActive(subscription);
  const monthlyPlan = SUBSCRIPTION_PLANS.monthly;
  const yearlyPlan = SUBSCRIPTION_PLANS.yearly;

  // =========================================================================
  // ÉTAT 2 : ABONNEMENT ACTIF VALIDÉ
  // Affichage immédiat et prioritaire de l'abonnement actif
  // =========================================================================
  if (hasActiveSub && subscription) {
    const isMonthly = subscription.plan === 'monthly';

    return (
      <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 space-y-8">
        {/* Bouton retour */}
        <div>
          <Link
            href="/formateur"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-[#5C4DF5] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'espace formateur</span>
          </Link>
        </div>

        {/* En-tête actif */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3.5 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>Abonnement Actif</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Votre espace formateur est opérationnel
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Votre abonnement est en règle. Vous disposez de tous les droits pour publier vos formations, gérer vos élèves et percevoir 100% de vos revenus.
          </p>
        </div>

        {/* Carte de statut détaillé */}
        <div className="max-w-2xl mx-auto">
          <SubscriptionStatus subscription={subscription} showManageButton={false} />
        </div>

        {/* Avantages actifs */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-[#F0F2F6] p-6 sm:p-7 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Avantages inclus dans votre formule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-gray-900 font-semibold">Publication illimitée</strong>
                <span>Publiez tous vos cours sans restriction</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-gray-900 font-semibold">0% de commission SkillUp</strong>
                <span>100% du prix des ventes vous revient</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-gray-900 font-semibold">Gestion du curriculum</strong>
                <span>Vidéos streaming et leçons structurées</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-gray-900 font-semibold">Reversement direct</strong>
                <span>Paiements automatisés Mobile Money</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/formateur"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer"
            >
              <span>Accéder à l'espace de gestion formateur</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Option de surclassement si abonnement mensuel */}
        {isMonthly && (
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5C4DF5] uppercase tracking-wider">
                  Surclassement annuel
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Économisez 2 mois
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Passez au plan annuel à <strong>{formatPlanPrice(yearlyPlan.amount, yearlyPlan.currency)} / an</strong> pour maximiser votre rentabilité.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSubscribe('yearly')}
              disabled={processingPlan !== null}
              className="inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {processingPlan === 'yearly' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connexion FedaPay...</span>
                </>
              ) : (
                <>
                  <span>Passer au plan annuel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // ÉTAT 3 : AUCUN ABONNEMENT ACTIF (OU EXPIRÉ / ANNULÉ)
  // Affichage des offres d'abonnement FedaPay
  // =========================================================================
  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 space-y-8">
      {/* Bouton retour */}
      <div>
        <Link
          href="/formateur"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-[#5C4DF5] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'espace formateur</span>
        </Link>
      </div>

      {/* En-tête de page */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C4DF5] bg-[#EDE9FE] px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Abonnement Formateur</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Activez votre espace formateur
        </h1>

        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Un abonnement est requis uniquement pour publier vos formations sur la plateforme SkillUp.
          Paiement sécurisé par <strong>FedaPay</strong> (Mobile Money & Carte).
        </p>
      </div>

      {/* Alerte d'erreur si échec */}
      {errorMessage && (
        <div className="max-w-2xl mx-auto bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Impossible d'initialiser le paiement :</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Statut actuel (expiré, annulé ou inactif) */}
      <div className="max-w-2xl mx-auto">
        <SubscriptionStatus subscription={subscription} showManageButton={false} />
      </div>

      {/* Les 2 Plans d'Abonnement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch">
        {/* PLAN 1 : MENSUEL */}
        <div className="bg-white rounded-3xl border border-[#F0F2F6] p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 hover:border-gray-300 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Flexibilité
              </span>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                {monthlyPlan.badge}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900">{monthlyPlan.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{monthlyPlan.tagline}</p>
            </div>

            <div className="pt-2 pb-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-gray-900">
                  {formatPlanPrice(monthlyPlan.amount, monthlyPlan.currency)}
                </span>
                <span className="text-xs text-gray-400 font-semibold">/ mois</span>
              </div>
              <span className="text-xs text-gray-400 block mt-0.5">
                Facturation mensuelle sans engagement
              </span>
            </div>

            <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-gray-600">
              {monthlyPlan.features.map((feat, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleSubscribe('monthly')}
            disabled={processingPlan !== null}
            className="w-full py-3.5 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingPlan === 'monthly' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connexion FedaPay...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Continuer vers le paiement</span>
              </>
            )}
          </button>
        </div>

        {/* PLAN 2 : ANNUEL */}
        <div className="bg-white rounded-3xl border-2 border-[#5C4DF5] p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Badge Populaire */}
          <div className="absolute top-0 right-0 bg-[#5C4DF5] text-white text-[10px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-bl-xl shadow-sm">
            Recommandé
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5C4DF5]">
                Sérénité
              </span>
              <span className="text-xs font-semibold text-[#5C4DF5] bg-[#EDE9FE] px-2.5 py-0.5 rounded-full">
                {yearlyPlan.badge}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900">{yearlyPlan.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{yearlyPlan.tagline}</p>
            </div>

            <div className="pt-2 pb-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-[#5C4DF5]">
                  {formatPlanPrice(yearlyPlan.amount, yearlyPlan.currency)}
                </span>
                <span className="text-xs text-gray-400 font-semibold">/ an</span>
              </div>
              <span className="text-xs text-emerald-600 font-medium block mt-0.5">
                Économisez l'équivalent de 2 mois complets
              </span>
            </div>

            <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-gray-600">
              {yearlyPlan.features.map((feat, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleSubscribe('yearly')}
            disabled={processingPlan !== null}
            className="w-full py-3.5 px-4 rounded-xl bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingPlan === 'yearly' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connexion FedaPay...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Continuer vers le paiement</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Garantie et Sécurité FedaPay */}
      <div className="max-w-2xl mx-auto bg-gray-50 border border-gray-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Paiement 100% sécurisé via <strong>FedaPay</strong>. Compatible MTN, Moov, Orange et Carte bancaire.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 font-semibold text-[11px] uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          <span>Chiffrement SSL</span>
        </div>
      </div>
    </div>
  );
}
