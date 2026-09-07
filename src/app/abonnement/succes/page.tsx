'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { saveInstructorSubscriptionLocal } from '@/lib/subscriptions';
import { formatPlanPrice, getPlanConfig } from '@/lib/subscriptions/plans';
import { SubscriptionPlan } from '@/types';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Home,
} from 'lucide-react';

function SuccesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();

  const transactionId = searchParams.get('transaction_id') || searchParams.get('id');
  const planParam = (searchParams.get('plan') as SubscriptionPlan) || 'monthly';

  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [verified, setVerified] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('verifying');
  const [message, setMessage] = useState<string>('Vérification du paiement en cours...');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan>(planParam);

  const verifyPayment = async () => {
    if (!transactionId) {
      setIsVerifying(false);
      setStatus('error');
      setMessage('Identifiant de transaction introuvable.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(
        `/api/payments/fedapay/verify?transaction_id=${encodeURIComponent(transactionId)}&plan=${planParam}`
      );
      const data = await res.json();

      if (res.ok && data.verified && data.subscriptionActive) {
        setVerified(true);
        setStatus('approved');
        setMessage(data.message || 'Votre abonnement a été activé avec succès !');
        setExpiresAt(data.expiresAt);
        if (data.plan) setPlan(data.plan);

        // Synchronisation locale pour rafraîchir immédiatement les composants clients
        if (user?.id) {
          saveInstructorSubscriptionLocal({
            id: `sub_${transactionId}`,
            instructor_id: user.id,
            status: 'active',
            plan: data.plan || planParam,
            started_at: new Date().toISOString(),
            expires_at: data.expiresAt,
            provider: 'fedapay',
            provider_subscription_id: transactionId,
          });
        }
      } else if (data.status === 'pending') {
        setStatus('pending');
        setMessage(
          data.message ||
            'Votre paiement est en cours de traitement. Votre abonnement sera activé dès réception de la confirmation finale.'
        );
      } else {
        setStatus('failed');
        setMessage(
          data.message ||
            'La transaction n a pas pu être confirmée. Aucun montant n a été débité.'
        );
      }
    } catch (err) {
      console.error('Erreur vérification:', err);
      setStatus('error');
      setMessage('Erreur réseau lors de la vérification du paiement auprès du serveur.');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      verifyPayment();
    } else if (!authLoading && !user) {
      // Redirection si déconnecté
      router.replace('/connexion?redirect=/abonnement');
    }
  }, [authLoading, user, transactionId]);

  const planConfig = getPlanConfig(plan);

  return (
    <div className="max-w-xl mx-auto py-10 sm:py-16 px-4">
      <div className="bg-white rounded-3xl border border-[#F0F2F6] p-8 sm:p-10 shadow-sm text-center space-y-6">
        {/* ÉTAT 1 : VÉRIFICATION EN COURS */}
        {isVerifying && (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-[#5C4DF5] flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Vérification du paiement en cours...
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                Nous interrogeons actuellement la passerelle sécurisée FedaPay pour confirmer la transaction.
              </p>
            </div>
          </div>
        )}

        {/* ÉTAT 2 : PAIEMENT VÉRIFIÉ ET ABONNEMENT ACTIF */}
        {!isVerifying && verified && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm shadow-emerald-100">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Paiement FedaPay Confirmé</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Félicitations !
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                {message}
              </p>
            </div>

            {/* Récapitulatif de l'abonnement activé */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 text-left space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Formule activée :</span>
                <span className="font-bold text-gray-900">{planConfig?.name || plan}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Statut :</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Actif
                </span>
              </div>
              {expiresAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Valable jusqu'au :</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(expiresAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Bouton vers l'espace formateur */}
            <div className="pt-2">
              <Link
                href="/formateur"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-sm font-bold py-3.5 px-6 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <span>Accéder à mon espace formateur</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ÉTAT 3 : PAIEMENT EN ATTENTE (PENDING) */}
        {!isVerifying && !verified && status === 'pending' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Paiement en cours de traitement
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                {message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={verifyPayment}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Rafraîchir le statut</span>
              </button>
              <Link
                href="/abonnement"
                className="w-full sm:w-auto inline-flex items-center justify-center text-gray-600 hover:text-gray-900 text-xs sm:text-sm font-semibold px-4 py-3 cursor-pointer"
              >
                <span>Retour aux abonnements</span>
              </Link>
            </div>
          </div>
        )}

        {/* ÉTAT 4 : ÉCHEC OU ERREUR */}
        {!isVerifying && !verified && status !== 'pending' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Paiement non confirmé
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                {message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/abonnement"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition-all cursor-pointer"
              >
                <span>Réessayer la souscription</span>
              </Link>
              <Link
                href="/formateur"
                className="w-full sm:w-auto inline-flex items-center justify-center text-gray-600 hover:text-gray-900 text-xs sm:text-sm font-semibold px-4 py-3 cursor-pointer"
              >
                <span>Espace formateur</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AbonnementSuccesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-gray-400">
          Chargement de la confirmation de paiement...
        </div>
      }
    >
      <SuccesContent />
    </Suspense>
  );
}
