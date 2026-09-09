'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Settings,
  Bell,
  Lock,
  User,
  Shield,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mail,
  Smartphone,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function ParametresPage() {
  const router = useRouter();
  const { user, profile, resetPassword, signOut, isLoading } = useAuth();

  // 1. Préférences de notifications (persistées dans le navigateur)
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [courseAlerts, setCourseAlerts] = useState(true);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // 2. Réinitialisation mot de passe
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Charger les réglages au démarrage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmailNotifs = localStorage.getItem('skillup_setting_email_notifs');
      const savedCourseAlerts = localStorage.getItem('skillup_setting_course_alerts');
      if (savedEmailNotifs !== null) setEmailNotifs(savedEmailNotifs === 'true');
      if (savedCourseAlerts !== null) setCourseAlerts(savedCourseAlerts === 'true');
    }
  }, []);

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleToggleEmailNotifs = () => {
    const next = !emailNotifs;
    setEmailNotifs(next);
    localStorage.setItem('skillup_setting_email_notifs', String(next));
    triggerToast(`Notifications par email ${next ? 'activées' : 'désactivées'}.`);
  };

  const handleToggleCourseAlerts = () => {
    const next = !courseAlerts;
    setCourseAlerts(next);
    localStorage.setItem('skillup_setting_course_alerts', String(next));
    triggerToast(`Alertes de nouvelles leçons ${next ? 'activées' : 'désactivées'}.`);
  };

  const handleRequestPasswordReset = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    setResetMessage(null);

    const { error } = await resetPassword(user.email);
    setIsResetting(false);

    if (error) {
      setResetMessage({
        type: 'error',
        text: error.message || 'Impossible d’envoyer le lien de réinitialisation.',
      });
    } else {
      setResetMessage({
        type: 'success',
        text: `Un lien sécurisé de réinitialisation a été envoyé à ${user.email}.`,
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/connexion');
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs sm:text-sm text-gray-400">
        Chargement de vos paramètres...
      </div>
    );
  }

  const userRole = profile?.role || (user?.user_metadata?.role as string) || 'student';
  const userRoleLabel = userRole === 'instructor' ? 'Formateur' : 'Élève';

  return (
    <div className="py-4 sm:py-6 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Bannière d'en-tête */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#F0F2F6] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Paramètres du compte
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Gérez vos préférences, la sécurité de vos accès et vos notifications.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1 : PRÉFÉRENCES DES NOTIFICATIONS */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#F0F2F6] shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
          <Bell className="w-5 h-5 text-[#5C4DF5]" />
          <h2 className="text-base font-bold text-gray-900">Notifications et alertes</h2>
        </div>

        <div className="space-y-4">
          {/* Toggle 1 : Notifications email */}
          <div className="flex items-center justify-between gap-4 py-2">
            <div>
              <p className="text-sm font-semibold text-gray-800">Notifications par email</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Recevez les récapitulatifs d'apprentissage et informations importantes de vos cours.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleEmailNotifs}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                emailNotifs ? 'bg-[#5C4DF5]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                  emailNotifs ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2 : Alertes cours */}
          <div className="flex items-center justify-between gap-4 py-2 border-t border-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-800">Alertes de progression et nouvelles leçons</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Notifications instantanées lorsqu'un formateur met à jour un cours ou publie un quiz.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleCourseAlerts}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                courseAlerts ? 'bg-[#5C4DF5]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                  courseAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2 : SÉCURITÉ & MOT DE PASSE */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#F0F2F6] shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
          <Lock className="w-5 h-5 text-[#5C4DF5]" />
          <h2 className="text-base font-bold text-gray-900">Sécurité et mot de passe</h2>
        </div>

        {resetMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 ${
              resetMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {resetMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            )}
            <span>{resetMessage.text}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div>
            <p className="text-sm font-semibold text-gray-800">Modifier mon mot de passe</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Envoyez un lien sécurisé sur votre adresse ({user?.email}) pour mettre à jour votre mot de passe.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRequestPasswordReset}
            disabled={isResetting}
            className="inline-flex items-center justify-center gap-2 bg-[#EDE9FE] hover:bg-[#E0DCFE] text-[#5C4DF5] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-60"
          >
            {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
            <span>Envoyer le lien</span>
          </button>
        </div>
      </div>

      {/* SECTION 3 : COMPTE & RÔLE */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#F0F2F6] shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
          <User className="w-5 h-5 text-[#5C4DF5]" />
          <h2 className="text-base font-bold text-gray-900">Informations de compte</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="bg-gray-50 p-4 rounded-xl space-y-1">
            <span className="text-gray-400 font-medium">Adresse email</span>
            <p className="font-semibold text-gray-800">{user?.email || 'Non renseigné'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl space-y-1">
            <span className="text-gray-400 font-medium">Type de profil</span>
            <p className="font-semibold text-[#5C4DF5]">{userRoleLabel}</p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/mon-compte"
            className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <span>Modifier mes informations personnelles</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
