'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Smartphone,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  Laptop,
  Apple,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  onOpenModal,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showScrollBanner, setShowScrollBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Détection de l'appareil
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const iosDevice = /iphone|ipad|ipod/.test(userAgent);
      const androidDevice = /android/.test(userAgent);
      setIsIos(iosDevice);
      setIsAndroid(androidDevice);

      // Vérifier si l'application est déjà installée (mode standalone)
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true);
      }

      // Écouter l'événement standard PWA d'installation
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  // Détection du défilement (scroll > 200px) pour afficher la bannière sobre
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200 && !bannerDismissed && !isInstalled) {
        setShowScrollBanner(true);
      } else if (window.scrollY <= 150) {
        setShowScrollBanner(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bannerDismissed, isInstalled]);

  // Action d'installation native (Chrome / Edge / Android)
  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setShowScrollBanner(false);
        onClose();
      }
      setDeferredPrompt(null);
    } else {
      // Si sur iPhone ou si prompt non capturé, ouvrir le guide détaillé
      onOpenModal();
    }
  }, [deferredPrompt, onClose, onOpenModal]);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. BANNIÈRE FLOTTANTE AU SCROLL (SOBRE & DISCRÈTE EN BAS D'ÉCRAN) */}
      {/* ========================================================================= */}
      {showScrollBanner && !isOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-white/95 backdrop-blur-md border border-[#ECEAFE] rounded-3xl p-3.5 sm:p-4 shadow-2xl shadow-indigo-200/50 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo SkillUp */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5C4DF5] to-[#7C6FF6] flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                Installer l&apos;application SkillUp
              </h4>
              <p className="text-[11px] text-gray-500 truncate">
                Accès direct 1 clic sur votre écran d&apos;accueil
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBannerDismissed(true);
                setShowScrollBanner(false);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL D'INSTALLATION COMPLET & ADAPTATIF (IPHONE / ANDROID / PC) */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150 relative">
            
            {/* Bouton de fermeture */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center cursor-pointer transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* En-tête du modal */}
            <div className="p-6 sm:p-8 text-center space-y-3 bg-gradient-to-b from-[#F8F7FF] to-white border-b border-gray-100">
              {/* Logo officiel en grand */}
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#5C4DF5] to-[#7C6FF6] flex items-center justify-center text-white shadow-xl shadow-indigo-200 mx-auto">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Installer l&apos;application SkillUp
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Profitez d&apos;un accès instantané depuis votre écran d&apos;accueil, d&apos;un confort plein écran et d&apos;un suivi fluide de vos cours.
              </p>
            </div>

            {/* Contenu spécifique selon l'appareil détecté */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* CAS 1 : IPHONE / IPAD (SAFARI IOS) */}
              {isIos ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-[#EDE9FE] text-[#5C4DF5] text-xs font-bold px-3 py-1 rounded-full">
                    <span>📱 Guide pour iPhone & iPad</span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 font-medium">
                    Suivez ces 3 étapes simples dans Safari pour ajouter SkillUp à votre écran :
                  </p>

                  <div className="space-y-3">
                    
                    {/* Étape 1 iOS */}
                    <div className="flex items-start gap-3.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      <div className="w-7 h-7 rounded-xl bg-white border border-gray-200 text-[#5C4DF5] flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                        1
                      </div>
                      <div className="text-xs text-gray-700 leading-relaxed">
                        Appuyez sur le bouton <strong>Partager</strong> en bas de votre écran Safari{' '}
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-white border border-gray-300 rounded text-blue-600 font-bold mx-1">
                          ↑
                        </span>
                      </div>
                    </div>

                    {/* Étape 2 iOS */}
                    <div className="flex items-start gap-3.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      <div className="w-7 h-7 rounded-xl bg-white border border-gray-200 text-[#5C4DF5] flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                        2
                      </div>
                      <div className="text-xs text-gray-700 leading-relaxed">
                        Faites défiler vers le bas et sélectionnez{' '}
                        <strong className="text-gray-900">« Sur l&apos;écran d&apos;accueil »</strong>{' '}
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-white border border-gray-300 rounded text-gray-700 mx-1 font-bold">
                          ＋
                        </span>
                      </div>
                    </div>

                    {/* Étape 3 iOS */}
                    <div className="flex items-start gap-3.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      <div className="w-7 h-7 rounded-xl bg-white border border-gray-200 text-[#5C4DF5] flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                        3
                      </div>
                      <div className="text-xs text-gray-700 leading-relaxed">
                        Appuyez sur <strong className="text-gray-900">« Ajouter »</strong> en haut à droite. L&apos;icône officielle SkillUp apparaîtra immédiatement sur votre téléphone !
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                /* CAS 2 : ANDROID OU ORDINATEUR (CHROME / EDGE / WINDOWS / MAC) */
                <div className="space-y-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-[#EDE9FE] text-[#5C4DF5] text-xs font-bold px-3 py-1 rounded-full">
                    <span>⚡ Installation instantanée</span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                    Cliquez sur le bouton ci-dessous pour ajouter l&apos;application SkillUp directement à votre appareil sans passer par un magasin d&apos;applications.
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white font-bold text-sm py-4 px-6 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Installer l&apos;application maintenant</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-400 pt-1">
                    Compatible avec Android, Windows, Mac et tablettes
                  </p>
                </div>
              )}

              {/* Bouton de validation */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-center py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};
