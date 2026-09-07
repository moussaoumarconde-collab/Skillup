'use client';

import React from 'react';
import Link from 'next/link';
import { InstructorSubscription } from '@/types';
import { isSubscriptionActive, formatSubscriptionDate } from '@/lib/subscriptions';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface SubscriptionStatusProps {
  subscription?: InstructorSubscription | null;
  showManageButton?: boolean;
  isLoading?: boolean;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  subscription,
  showManageButton = true,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#F0F2F6] p-5 sm:p-7 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center shrink-0">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-gray-200 rounded w-44 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded w-60 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const active = isSubscriptionActive(subscription);
  const status = subscription?.status || 'inactive';
  const planLabel = subscription?.plan === 'yearly' ? 'Annuel' : 'Mensuel';

  // =========================================================================
  // ÉTAT 1 : ABONNEMENT ACTIF
  // =========================================================================
  if (active && subscription) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-100 p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Votre abonnement est actif
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Publication autorisée
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                Plan : <span className="font-semibold text-gray-800">{planLabel}</span> • Expire le :{' '}
                <span className="font-semibold text-gray-800">
                  {formatSubscriptionDate(subscription.expires_at)}
                </span>
              </p>
            </div>
          </div>

          {showManageButton && (
            <Link
              href="/abonnement"
              className="inline-flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <span>Gérer mon abonnement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // ÉTAT 2 : ABONNEMENT EXPIRÉ
  // =========================================================================
  if (status === 'expired' || (subscription && !active && status === 'active')) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-amber-200 p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Abonnement expiré
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  Publication suspendue
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Votre abonnement a expiré{subscription?.expires_at ? ` le ${formatSubscriptionDate(subscription.expires_at)}` : ''}. Renouvelez-le pour autoriser à nouveau la publication.
              </p>
            </div>
          </div>

          {showManageButton && (
            <Link
              href="/abonnement"
              className="inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <span>Renouveler</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // ÉTAT 3 : ABONNEMENT ANNULÉ
  // =========================================================================
  if (status === 'canceled') {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-rose-100 p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Abonnement annulé
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  Annulé
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Votre abonnement a été résilié. Vous pouvez réactiver un abonnement pour publier de nouvelles formations.
              </p>
            </div>
          </div>

          {showManageButton && (
            <Link
              href="/abonnement"
              className="inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <span>Réactiver</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // ÉTAT 4 : AUCUN ABONNEMENT ACTIF (Par défaut)
  // =========================================================================
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#F0F2F6] p-5 sm:p-7 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Votre abonnement
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                Aucun abonnement actif
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Pour publier vos formations, vous devez disposer d’un abonnement actif.
            </p>
          </div>
        </div>

        {showManageButton && (
          <Link
            href="/abonnement"
            className="inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Choisir un abonnement</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
};
