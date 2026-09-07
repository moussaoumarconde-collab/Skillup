'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Smartphone,
  ShieldAlert,
  Loader2,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  InstructorWallet,
  WalletTransaction,
  InstructorPayoutAccount,
  PayoutMode,
} from '@/types';

const OPERATORS: { id: PayoutMode; name: string; country: string }[] = [
  { id: 'mtn_open', name: 'MTN Mobile Money', country: 'Bénin (BJ)' },
  { id: 'moov', name: 'Moov Money', country: 'Bénin (BJ)' },
  { id: 'wave_ci', name: 'Wave Money', country: 'Côte d’Ivoire (CI)' },
  { id: 'orange_ci', name: 'Orange Money', country: 'Côte d’Ivoire (CI)' },
  { id: 'mtn_ci', name: 'MTN Mobile Money', country: 'Côte d’Ivoire (CI)' },
  { id: 'togocel', name: 'T-Money (Togocel)', country: 'Togo (TG)' },
  { id: 'moov_tg', name: 'Moov Money', country: 'Togo (TG)' },
];

export const InstructorWalletDashboard: React.FC = () => {
  const [wallet, setWallet] = useState<InstructorWallet | null>(null);
  const [payoutAccount, setPayoutAccount] = useState<InstructorPayoutAccount | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formulaire d'édition Mobile Money
  const [isEditingAccount, setIsEditingAccount] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<PayoutMode>('mtn_open');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [isSavingAccount, setIsSavingAccount] = useState<boolean>(false);
  const [accountSuccessMsg, setAccountSuccessMsg] = useState<string | null>(null);

  // Gestion des retentatives de reversement
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryResult, setRetryResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  const fetchWalletData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/instructor/wallet');
      const data = await res.json();
      if (res.ok && data.success) {
        setWallet(data.wallet);
        setPayoutAccount(data.payoutAccount);
        setTransactions(data.transactions || []);
        if (data.payoutAccount) {
          setSelectedMode(data.payoutAccount.payout_mode || 'mtn_open');
          setPhoneNumber(data.payoutAccount.phone_number || '');
          setAccountName(data.payoutAccount.account_name || '');
        }
      } else {
        setErrorMessage(data.error || 'Erreur lors du chargement des données financières.');
      }
    } catch (err) {
      console.error('Erreur chargement wallet:', err);
      setErrorMessage('Erreur réseau lors de la récupération du portefeuille.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleSavePayoutAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAccount(true);
    setAccountSuccessMsg(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/instructor/payout-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payout_mode: selectedMode,
          phone_number: phoneNumber.trim(),
          account_name: accountName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAccountSuccessMsg('Coordonnées Mobile Money enregistrées avec succès.');
        setIsEditingAccount(false);
        fetchWalletData();
        setTimeout(() => setAccountSuccessMsg(null), 4000);
      } else {
        setErrorMessage(data.error || 'Erreur lors de l’enregistrement du compte.');
      }
    } catch (err) {
      console.error('Erreur sauvegarde compte:', err);
      setErrorMessage('Erreur réseau lors de l’enregistrement.');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleRetryPayout = async (txId: string) => {
    setRetryingId(txId);
    setRetryResult(null);

    try {
      const res = await fetch('/api/instructor/wallet/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRetryResult({
          id: txId,
          success: true,
          msg: 'Nouvelle tentative initiée avec succès !',
        });
        fetchWalletData();
      } else {
        setRetryResult({
          id: txId,
          success: false,
          msg: data.error || 'Échec de la nouvelle tentative auprès de FedaPay.',
        });
      }
    } catch (err) {
      setRetryResult({
        id: txId,
        success: false,
        msg: 'Erreur réseau lors de la retentive.',
      });
    } finally {
      setRetryingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-[#F0F2F6] p-8 text-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#5C4DF5] mx-auto" />
        <p className="text-xs text-gray-500">Chargement de votre portefeuille formateur...</p>
      </div>
    );
  }

  const failedPayoutCount = transactions.filter(
    (t) => t.type === 'payout' && t.payout_status === 'failed'
  ).length;

  return (
    <div className="space-y-6">
      {/* Messages d'alerte / succès */}
      {accountSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{accountSuccessMsg}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. EN-TÊTE ET RÈGLE FINANCIÈRE V1 */}
      <div className="bg-white rounded-3xl border border-[#F0F2F6] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5C4DF5] flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Portefeuille & Reversements
              </h2>
              <p className="text-xs text-gray-500">
                Gains issus des ventes de vos formations et transferts Mobile Money
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-purple-50 text-[#5C4DF5] px-3 py-1.5 rounded-xl text-xs font-bold self-start sm:self-auto">
            <Info className="w-3.5 h-3.5" />
            <span>0% commission SkillUp (100% pour vous)</span>
          </div>
        </div>

        {/* 2. CARTES DES SOLDES (STRICTEMENT RÉELLES) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Gains Totaux Générés */}
          <div className="bg-[#F8F9FC] border border-gray-100 rounded-2xl p-5 space-y-1">
            <p className="text-xs text-gray-500 font-medium">Gains totaux générés</p>
            <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {(wallet?.total_earned || 0).toLocaleString('fr-FR')} FCFA
            </p>
            <p className="text-[11px] text-gray-400">100% de la valeur de vos ventes</p>
          </div>

          {/* Solde en attente (Reversement automatique pending / non exécuté) */}
          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-800 font-semibold">Solde en attente</p>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight">
              {(wallet?.pending_balance || 0).toLocaleString('fr-FR')} FCFA
            </p>
            <p className="text-[11px] text-amber-700/80">
              Conservé en sécurité jusqu'au transfert
            </p>
          </div>

          {/* Solde disponible / envoyé */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-emerald-800 font-semibold">Statut compte</p>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-900 tracking-tight">
              {payoutAccount?.phone_number ? 'Actif' : 'À configurer'}
            </p>
            <p className="text-[11px] text-emerald-700/80">
              {payoutAccount?.phone_number
                ? `${payoutAccount.payout_mode} • ${payoutAccount.phone_number}`
                : 'Configurez votre Mobile Money'}
            </p>
          </div>
        </div>

        {/* 3. ALERTE PAYOUT FEDAPAY SI FONDS EN ATTENTE OU REVERSEMENT ÉCHOUÉ */}
        {failedPayoutCount > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-rose-900">
                  {failedPayoutCount} reversement(s) en attente d’activation
                </h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Vos gains sont conservés dans votre solde en attente. Si FedaPay Payout n'est pas encore activé sur votre compte marchand, les fonds restent protégés et pourront être transférés dès activation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. CONFIGURATION MOBILE MONEY DE REVERSEMENT */}
        <div className="border-t border-gray-100 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#5C4DF5]" />
              <h3 className="text-sm font-bold text-gray-900">
                Coordonnées de réception Mobile Money
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingAccount(!isEditingAccount)}
              className="text-xs font-semibold text-[#5C4DF5] hover:text-[#4B3CE0] cursor-pointer"
            >
              {isEditingAccount
                ? 'Annuler'
                : payoutAccount
                ? 'Modifier mes coordonnées'
                : '+ Configurer mon numéro'}
            </button>
          </div>

          {!isEditingAccount && payoutAccount ? (
            <div className="bg-[#F8F9FC] border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">
                  Opérateur :{' '}
                  <span className="text-[#5C4DF5]">
                    {OPERATORS.find((op) => op.id === payoutAccount.payout_mode)?.name ||
                      payoutAccount.payout_mode}
                  </span>
                </p>
                <p className="text-gray-600">
                  Numéro de téléphone : <strong>{payoutAccount.phone_number}</strong>
                </p>
                {payoutAccount.account_name && (
                  <p className="text-gray-500">Nom associé : {payoutAccount.account_name}</p>
                )}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Prêt pour reversement automatique</span>
              </div>
            </div>
          ) : !isEditingAccount && !payoutAccount ? (
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-800 flex items-center justify-between gap-3">
              <span>
                Vous n'avez pas encore renseigné votre numéro Mobile Money. Renseignez-le pour recevoir automatiquement vos reversements.
              </span>
              <button
                type="button"
                onClick={() => setIsEditingAccount(true)}
                className="bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white px-3.5 py-1.5 rounded-xl font-semibold shrink-0 cursor-pointer"
              >
                Configurer
              </button>
            </div>
          ) : null}

          {/* Formulaire de configuration */}
          {isEditingAccount && (
            <form
              onSubmit={handleSavePayoutAccount}
              className="bg-[#F8F9FC] border border-gray-200 rounded-2xl p-5 space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Opérateur Mobile Money</label>
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value as PayoutMode)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]"
                  >
                    {OPERATORS.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.name} ({op.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Numéro Mobile Money</label>
                  <input
                    type="tel"
                    placeholder="Ex: 97000000 ou 0700000000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">
                  Nom du titulaire du compte (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Nom complet tel qu'enregistré sur la SIM"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAccount(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingAccount}
                  className="bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isSavingAccount && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Enregistrer mes coordonnées</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 5. HISTORIQUE DES TRANSACTIONS FINANCIÈRES (LEDGER IMMUABLE) */}
      <div className="bg-white rounded-3xl border border-[#F0F2F6] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-gray-900">
            Historique des transactions
          </h3>
          <span className="text-xs text-gray-400">{transactions.length} mouvement(s)</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            Aucune transaction financière enregistrée pour l’instant.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => {
              const isSale = tx.type === 'credit_sale';
              const isPayout = tx.type === 'payout';
              const isFailed = tx.payout_status === 'failed';
              const isProcessing = tx.payout_status === 'processing' || tx.payout_status === 'pending';
              const isSuccess = tx.payout_status === 'successful';

              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                          isSale
                            ? 'bg-emerald-50 text-emerald-700'
                            : isFailed
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {isSale
                          ? 'Vente formation (100%)'
                          : isFailed
                          ? 'Reversement échoué'
                          : 'Reversement Mobile Money'}
                      </span>

                      {tx.created_at && (
                        <span className="text-gray-400">
                          {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 font-medium">{tx.description}</p>

                    {/* Résultat d'une tentative de retry */}
                    {retryResult && retryResult.id === tx.id && (
                      <p
                        className={`text-[11px] font-semibold ${
                          retryResult.success ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {retryResult.msg}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span
                      className={`text-sm font-bold ${
                        isSale ? 'text-emerald-600' : 'text-gray-900'
                      }`}
                    >
                      {isSale ? '+' : '-'} {tx.amount.toLocaleString('fr-FR')} FCFA
                    </span>

                    {/* Bouton pour retenter un reversement échoué */}
                    {isPayout && isFailed && (
                      <button
                        type="button"
                        onClick={() => handleRetryPayout(tx.id)}
                        disabled={retryingId === tx.id}
                        className="inline-flex items-center gap-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-75"
                      >
                        {retryingId === tx.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        <span>Réessayer</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
