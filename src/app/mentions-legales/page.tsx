import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Mail, Phone, Globe, Server } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions Légales - SkillUp',
  description: 'Mentions légales et coordonnées officielles de la plateforme SkillUp.',
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FC] text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation retour */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#5C4DF5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>

        {/* En-tête */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Mentions Légales
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Dernière mise à jour : 10 septembre 2026
          </p>
        </div>

        {/* Contenu sobre et conforme */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-gray-700 leading-relaxed">
          
          {/* Section 1 : Édition & Contact */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>1. Édition de la plateforme</span>
            </h2>
            <p>
              Le site et la plateforme <strong>SkillUp</strong> sont édités et gérés par l&apos;équipe SkillUp.
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                <Mail className="w-4 h-4 text-[#5C4DF5] shrink-0" />
                <span>Email de contact : </span>
                <a
                  href="mailto:camarayou360@gmail.com"
                  className="font-semibold text-gray-900 hover:text-[#5C4DF5] underline"
                >
                  camarayou360@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                <Phone className="w-4 h-4 text-[#5C4DF5] shrink-0" />
                <span>Téléphone & WhatsApp : </span>
                <a
                  href="https://wa.me/22890286347"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-900 hover:text-[#5C4DF5] underline"
                >
                  +228 90 28 63 47
                </a>
              </div>
            </div>
          </section>

          {/* Section 2 : Hébergement */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#5C4DF5]" />
              <span>2. Hébergement de l&apos;application</span>
            </h2>
            <p>
              L&apos;infrastructure et le déploiement de la plateforme SkillUp sont assurés par :
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs sm:text-sm text-gray-600">
              <li>
                <strong>Vercel Inc.</strong> — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (Site : vercel.com)
              </li>
              <li>
                <strong>Supabase Inc.</strong> — Infrastructure base de données et authentification sécurisée (Site : supabase.com)
              </li>
            </ul>
          </section>

          {/* Section 3 : Propriété intellectuelle */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              3. Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble des éléments constituant la plateforme SkillUp (structure, interface, charte graphique, logos, cours, vidéos, quiz, textes et éléments sonores) sont protégés par le droit de la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable.
            </p>
          </section>

          {/* Section 4 : Protection des données */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              4. Protection des données personnelles
            </h2>
            <p>
              SkillUp s&apos;engage à préserver la confidentialité des informations fournies par les utilisateurs dans le cadre de leur inscription et de leur parcours d&apos;apprentissage.
            </p>
            <p>
              Pour toute question, demande de modification ou suppression de vos données, vous pouvez nous contacter directement par email à{' '}
              <a href="mailto:camarayou360@gmail.com" className="text-[#5C4DF5] font-semibold underline">
                camarayou360@gmail.com
              </a>.
            </p>
          </section>

          {/* Section 5 : Contact direct */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              5. Nous contacter
            </h2>
            <p>
              Pour toute information, signalement ou assistance technique :
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="mailto:camarayou360@gmail.com"
                className="inline-flex items-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Envoyer un email</span>
              </a>
              <a
                href="https://wa.me/22890286347"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Écrire sur WhatsApp (+228 90 28 63 47)</span>
              </a>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
