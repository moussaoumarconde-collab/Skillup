'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Video,
  Trophy,
  Award,
  CheckCircle2,
  ChevronDown,
  Download,
  Sparkles,
  Smartphone,
  Star,
  Users,
  Play,
  Check,
  Compass,
  Layers,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Comment fonctionnent les formations sur SkillUp ?",
    answer:
      "Chaque formation est structurée en modules et leçons concrètes. Vous apprenez pas à pas avec des vidéos claires, des cours interactifs et des quiz d'évaluation pour valider chaque compétence.",
  },
  {
    question: "L'application est-elle utilisable sur smartphone ?",
    answer:
      "Absolument. SkillUp a été conçue selon une approche mobile-first rigoureuse. Toutes les fonctionnalités (leçons, vidéo, quiz, téléchargements et suivi de performances) sont optimisées pour votre smartphone, tablette ou ordinateur.",
  },
  {
    question: "Comment mon certificat est-il délivré et vérifié ?",
    answer:
      "Dès que vous terminez toutes les leçons et réussissez le quiz final, votre certificat officiel est généré instantanément avec un identifiant unique infalsifiable, vérifiable par les recruteurs en ligne.",
  },
  {
    question: "Puis-je devenir formateur et publier mes cours ?",
    answer:
      "Oui ! En choisissant le profil Formateur, vous bénéficiez d'un studio complet pour organiser vos modules, filmer ou importer vos leçons vidéo directement depuis votre appareil, créer des quiz et percevoir vos revenus en toute sécurité.",
  },
  {
    question: "Quels sont les moyens de paiement acceptés ?",
    answer:
      "Pour les formations payantes et les abonnements formateurs, nous acceptons les paiements sécurisés par Mobile Money (MTN, Moov, Orange, Wave...) ainsi que par cartes bancaires grâce à notre passerelle certifiée FedaPay.",
  },
  {
    question: "Y a-t-il des formations gratuites disponibles ?",
    answer:
      "Oui, un large catalogue de cours de haute qualité est proposé 100 % gratuitement pour vous permettre de monter en compétences immédiatement sans engagement.",
  },
];

export const LandingPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(1); // Question 2 ouverte par défaut comme sur la capture 5
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-gray-900 font-sans selection:bg-[#EDE9FE] selection:text-[#5C4DF5]">
      {/* ========================================================================= */}
      {/* 1. HEADER / NAVBAR (CAPTURE 1) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo gauche avec halo lumineux */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-[#5C4DF5]/30 rounded-2xl blur-xs group-hover:bg-[#5C4DF5]/40 transition-all" />
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5C4DF5] to-[#7C6FF6] flex items-center justify-center text-white shadow-md shadow-indigo-200">
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
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">
              Skill<span className="text-[#5C4DF5]">Up</span>
            </span>
          </Link>

          {/* Navigation centrale (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a
              href="#fonctionnalites"
              className="hover:text-gray-900 transition-colors"
            >
              Fonctionnalités
            </a>
            <a
              href="#comment-ca-marche"
              className="hover:text-gray-900 transition-colors"
            >
              Comment ça marche
            </a>
            <Link
              href="/formations"
              className="hover:text-gray-900 transition-colors"
            >
              Catalogue
            </Link>
            <a
              href="#faq"
              className="hover:text-gray-900 transition-colors"
            >
              FAQ
            </a>
            <Link
              href="/support"
              className="hover:text-gray-900 transition-colors"
            >
              Nous contacter
            </Link>
          </nav>

          {/* Actions à droite */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/formations"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#5C4DF5]" />
              <span>App Mobile</span>
            </Link>

            <Link
              href="/connexion"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              Connexion
            </Link>

            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 bg-[#00A8B5] hover:bg-[#00929D] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-md shadow-cyan-100 active:scale-95 transition-all cursor-pointer"
            >
              <span>Commencer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Bouton Menu Mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu déroulant Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-5 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
            <a
              href="#fonctionnalites"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-700 py-1"
            >
              Fonctionnalités
            </a>
            <a
              href="#comment-ca-marche"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-700 py-1"
            >
              Comment ça marche
            </a>
            <Link
              href="/formations"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-700 py-1"
            >
              Catalogue de formations
            </Link>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-700 py-1"
            >
              FAQ
            </a>
            <Link
              href="/support"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-700 py-1"
            >
              Nous contacter
            </Link>
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link
                href="/connexion"
                className="w-full text-center py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="w-full text-center py-2.5 rounded-xl bg-[#00A8B5] text-white text-sm font-bold shadow-md"
              >
                Commencer maintenant
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (CAPTURE 1 & CAPTURE 2) */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        
        {/* Lueur d'ambiance en arrière-plan */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-[#EDE9FE]/70 via-[#F3F4F6]/40 to-transparent pointer-events-none -z-10 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-7">
          
          {/* Badge pilule supérieure */}
          <div className="inline-flex items-center gap-2 bg-[#EDE9FE] text-[#5C4DF5] border border-[#DDD6FE] text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-xs">
            <span className="text-base">🎓</span>
            <span className="tracking-wide uppercase text-[11px] sm:text-xs">
              Pour les apprenants et formateurs ambitieux
            </span>
          </div>

          {/* Grand titre court & convaincant */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Apprenez vite. <br />
            <span className="text-[#5C4DF5] drop-shadow-xs">
              Montez en compétences comme un pro.
            </span>
          </h1>

          {/* Sous-titre percutant */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Formations certifiantes, leçons vidéo concrètes, quiz interactifs et suivi de vos performances : 
            SkillUp centralise l'essentiel pour propulser votre réussite.
          </p>

          {/* Boutons d'action principaux */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              href="/inscription"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white font-bold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all cursor-pointer"
            >
              <span>Commencer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/formations"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-semibold text-sm sm:text-base px-7 py-4 rounded-2xl shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>Explorer l'application</span>
            </Link>
          </div>

          {/* ========================================================================= */}
          {/* MOCKUP FLOTTANT ANIMÉ EN BOUCLE (CAPTURE 2) */}
          {/* ========================================================================= */}
          <div className="pt-10 sm:pt-14 relative max-w-3xl mx-auto">
            
            {/* Conteneur avec animation sobre de flottement vertical de haut en bas */}
            <div className="animate-float-gentle relative">
              
              {/* Badge flottant 1 : En haut à droite */}
              <div className="absolute -top-5 -right-2 sm:-top-6 sm:right-6 z-20 bg-white/95 backdrop-blur-md border border-emerald-100 text-emerald-800 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Certificat validé !</span>
              </div>

              {/* Badge flottant 2 : À gauche */}
              <div className="absolute top-1/2 -left-3 sm:-left-8 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-md border border-[#ECEAFE] text-gray-900 p-3 sm:p-4 rounded-2xl shadow-xl text-left space-y-1">
                <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Progression cours
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-[#5C4DF5]">
                    100%
                  </span>
                  <span className="text-[10px] font-semibold bg-purple-50 text-[#5C4DF5] px-2 py-0.5 rounded-full">
                    Complété
                  </span>
                </div>
              </div>

              {/* Fenêtre principale du Mockup */}
              <div className="bg-white rounded-3xl border-2 border-[#F0F2F6] shadow-2xl p-5 sm:p-8 text-left space-y-5 relative overflow-hidden">
                
                {/* En-tête type macOS */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-gray-700 ml-2">
                      Mes Formations SkillUp
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#5C4DF5] bg-[#EDE9FE] px-2.5 py-1 rounded-full">
                    Session active
                  </span>
                </div>

                {/* Contenu interne de démonstration fidèle à SkillUp */}
                <div className="space-y-3">
                  
                  {/* Carte formation 1 (Terminée avec succès) */}
                  <div className="bg-[#F8F9FC] border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#5C4DF5] flex items-center justify-center font-black text-sm shrink-0">
                        JS
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                          Développement Web Moderne (TypeScript & Next.js)
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          12 leçons · 2 quiz réussis
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl">
                      Prêt & Certifié
                    </span>
                  </div>

                  {/* Carte formation 2 (En atelier / En cours) */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                        UI
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                          Design d'Applications Mobile-First
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          8 leçons · Module 2 en cours
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-xl">
                      En apprentissage
                    </span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION FONCTIONNALITÉS (CAPTURE 3) */}
      {/* ========================================================================= */}
      <section id="fonctionnalites" className="py-20 md:py-28 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          {/* En-tête de section */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center bg-[#EDE9FE] text-[#5C4DF5] text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full tracking-wider">
              Fonctionnalités
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
              Tout ce qu'il faut pour développer vos compétences.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Catalogue qualifié, apprentissage interactif, quiz certifiants et statistiques en direct : 
              SkillUp centralise l'essentiel de votre réussite.
            </p>
          </div>

          {/* Grille des 4 cartes de fonctionnalités */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 text-left">
            
            {/* Carte 1 : Catalogue */}
            <div className="bg-[#FDFDFF] border border-gray-200/80 hover:border-gray-300 rounded-3xl p-6 sm:p-7 space-y-4 transition-all hover:shadow-lg shadow-xs group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5C4DF5] flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Catalogue de formations
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Parcourez des cours complets créés par des formateurs certifiés et adaptés aux réalités du marché de l'emploi.
              </p>
            </div>

            {/* Carte 2 : Leçons vidéo & interactives */}
            <div className="bg-[#FDFDFF] border border-gray-200/80 hover:border-gray-300 rounded-3xl p-6 sm:p-7 space-y-4 transition-all hover:shadow-lg shadow-xs group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5C4DF5] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Leçons vidéo & interactives
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Apprenez à votre rythme avec des vidéos dynamiques, des fiches de synthèse et un studio intégré pour les formateurs.
              </p>
            </div>

            {/* Carte 3 : Quiz & Évaluations (Mise en avant avec bordure violette comme sur la capture 3) */}
            <div className="bg-white border-2 border-[#5C4DF5] ring-4 ring-[#5C4DF5]/10 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl transition-all group relative">
              <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Quiz & Évaluations
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Testez vos connaissances en temps réel avec des quiz interactifs et des corrections claires pour mesurer vos progrès.
              </p>
            </div>

            {/* Carte 4 : Certificats & Performances */}
            <div className="bg-[#FDFDFF] border border-gray-200/80 hover:border-gray-300 rounded-3xl p-6 sm:p-7 space-y-4 transition-all hover:shadow-lg shadow-xs group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5C4DF5] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Certificats vérifiables
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Obtenez des attestations numériques infalsifiables avec identifiant unique à partager avec les entreprises et clients.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION COMMENT ÇA MARCHE (CAPTURE 4) */}
      {/* ========================================================================= */}
      <section id="comment-ca-marche" className="py-20 md:py-28 bg-[#F8F9FC] border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          {/* En-tête de section */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center bg-[#E0F7F9] text-[#00A8B5] text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full tracking-wider">
              Comment ça marche
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
              Simple comme 1, 2, 3
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              De la découverte de votre formation à l'obtention de votre certificat en quelques étapes.
            </p>
          </div>

          {/* 3 Grandes Cartes Étape */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            
            {/* Étape 1 */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-10 space-y-5 shadow-xs hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-[#00A8B5] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-cyan-100">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Choisissez votre cours
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Explorez le catalogue, filtrez par catégorie ou niveau et sélectionnez la formation qui correspond à vos objectifs.
              </p>
            </div>

            {/* Étape 2 */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-10 space-y-5 shadow-xs hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-[#00A8B5] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-cyan-100">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Apprenez en pratique
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Visionnez les leçons vidéo, découvrez les modules interactifs et appliquez immédiatement les conseils des experts.
              </p>
            </div>

            {/* Étape 3 */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-10 space-y-5 shadow-xs hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-[#00A8B5] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-cyan-100">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Validez & Certifiez-vous
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Passez le quiz de certification, validez votre score et décrochez votre certificat officiel vérifiable en ligne.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION SOBRE : ACCÈS GRATUIT & CONTENUS SPÉCIALISÉS (2 COULEURS SEULEMENT) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-[#5C4DF5]">
            Accès 100 % gratuit pour démarrer
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Apprenez librement. Évoluez sans limites.
          </h3>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            L&apos;inscription à SkillUp est 100 % gratuite. Vous accédez immédiatement à des formations gratuites pour vous former, ainsi qu&apos;à des cours spécialisés payants selon vos besoins.
          </p>
          <div className="pt-2">
            <Link
              href="/formations"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#5C4DF5] hover:text-[#4B3CE0] underline underline-offset-4 cursor-pointer transition-colors"
            >
              <span>Accéder aux formations et commencer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION FAQ / QUESTIONS FRÉQUENTES (CAPTURE 5) */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 md:py-28 bg-[#F8F9FC] border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-12">
          
          {/* En-tête FAQ */}
          <div className="space-y-4">
            <div className="inline-flex items-center bg-[#E0F7F9] text-[#00A8B5] text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full tracking-wider">
              FAQ
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
              Questions fréquentes
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Tout ce que vous devez savoir sur SkillUp
            </p>
          </div>

          {/* Liste accordéon FAQ */}
          <div className="space-y-3.5 text-left">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={item.question}
                  className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="font-bold text-sm sm:text-base text-gray-900">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#5C4DF5]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100/70 pt-4 bg-[#FAFBFD]">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION BANNER (STYLE CAPTURE FOOTER) */}
      {/* ========================================================================= */}
      <section className="pt-12 pb-16 bg-[#F8F9FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-br from-[#1E1B4B] via-[#2E2880] to-[#1E1B4B] rounded-3xl p-8 sm:p-14 text-white space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Lueur subtile en fond de carte */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#5C4DF5]/30 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight relative z-10 max-w-2xl mx-auto leading-snug">
              Rejoignez des milliers d&apos;apprenants et créateurs qui réussissent avec SkillUp.
            </h2>

            <div className="pt-2 flex flex-col items-center justify-center gap-3 relative z-10">
              <Link
                href="/inscription"
                className="inline-flex items-center gap-2 bg-[#00A8B5] hover:bg-[#00929D] text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg shadow-cyan-900/30 active:scale-95 transition-all cursor-pointer"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-gray-300 font-medium">
                Aucune carte requise · Démarrage en 30 secondes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. GRAND FOOTER SOMBRE HAUT DE GAMME AVEC COORDONNÉES RÉELLES */}
      {/* ========================================================================= */}
      <footer className="bg-[#0B0D13] text-gray-300 pt-16 pb-10 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* 4 Colonnes du Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            
            {/* Colonne 1 : Identité SkillUp */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00A8B5] to-[#5C4DF5] flex items-center justify-center text-white font-black text-base shadow-md">
                  S
                </div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  Skill<span className="text-[#00A8B5]">Up</span>
                </span>
              </Link>
              <p className="text-xs text-gray-400 leading-relaxed">
                La plateforme d&apos;apprentissage et de formations pratiques mobile-first.
              </p>
            </div>

            {/* Colonne 2 : PRODUIT */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Produit
              </h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>
                  <a href="#fonctionnalites" className="hover:text-white transition-colors">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <Link href="/formations" className="hover:text-white transition-colors">
                    Catalogue de formations
                  </Link>
                </li>
                <li>
                  <a href="#comment-ca-marche" className="hover:text-white transition-colors">
                    Comment ça marche
                  </a>
                </li>
                <li>
                  <Link href="/abonnement" className="hover:text-white transition-colors">
                    Espace Formateur
                  </Link>
                </li>
              </ul>
            </div>

            {/* Colonne 3 : RESSOURCES & SUPPORT (COORDONNÉES RÉELLES) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Ressources & Support
              </h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:camarayou360@gmail.com"
                    className="hover:text-[#00A8B5] transition-colors break-all"
                  >
                    Support Email (<span className="text-gray-300 underline">camarayou360@gmail.com</span>)
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/22890286347"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#00A8B5] transition-colors"
                  >
                    Nous contacter (Appel & WhatsApp : <span className="text-white font-semibold underline">+228 90 28 63 47</span>)
                  </a>
                </li>
              </ul>
            </div>

            {/* Colonne 4 : LÉGAL & CONFIDENTIALITÉ */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Légal & Confidentialité
              </h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>
                  <Link href="/mentions-legales" className="hover:text-white transition-colors">
                    Mentions Légales
                  </Link>
                </li>
                <li>
                  <Link href="/cgu" className="hover:text-white transition-colors">
                    Conditions d&apos;Utilisation (CGU)
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-white transition-colors">
                    Centre d&apos;assistance
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Ligne inférieure de Copyright & Contacts directs */}
          <div className="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
            <div>
              © 2026 SkillUp. Tous droits réservés.
            </div>
            <div className="flex items-center gap-2 flex-wrap text-center sm:text-right">
              <span>Support direct :</span>
              <a href="mailto:camarayou360@gmail.com" className="text-gray-300 hover:text-white underline">
                camarayou360@gmail.com
              </a>
              <span>·</span>
              <a href="tel:+22890286347" className="text-white hover:text-[#00A8B5] font-semibold">
                +228 90 28 63 47
              </a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
