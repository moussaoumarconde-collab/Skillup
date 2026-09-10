import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Mail, Phone } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales d’Utilisation (CGU) - SkillUp',
  description: 'Conditions générales d’utilisation de la plateforme de formations SkillUp.',
};

export default function CguPage() {
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
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Conditions Générales d&apos;Utilisation (CGU)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Dernière mise à jour : 10 septembre 2026
          </p>
        </div>

        {/* Contenu sobre et clair */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-gray-700 leading-relaxed">
          
          {/* Article 1 : Objet */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Article 1 — Objet & Présentation
            </h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») ont pour objet d&apos;encadrer l&apos;accès et l&apos;utilisation de la plateforme en ligne <strong>SkillUp</strong> accessible depuis le web et mobile.
            </p>
            <p>
              SkillUp est une plateforme d&apos;apprentissage mobile-first permettant aux apprenants de découvrir, suivre des formations, participer à des quiz et obtenir des certificats, et aux formateurs de concevoir et publier des cours.
            </p>
          </section>

          {/* Article 2 : Inscription et Comptes */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Article 2 — Accès à la plateforme et comptes
            </h2>
            <p>
              L&apos;accès et l&apos;inscription à SkillUp sont <strong>100 % gratuits</strong>.
            </p>
            <p>
              Tout utilisateur peut créer un compte en qualité d&apos;<strong>Apprenant</strong> ou de <strong>Formateur</strong>. L&apos;utilisateur s&apos;engage à fournir des informations exactes lors de son inscription et à conserver la confidentialité de ses identifiants d&apos;accès.
            </p>
          </section>

          {/* Article 3 : Formations gratuites et payantes */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Article 3 — Formations gratuites & payantes
            </h2>
            <p>
              La plateforme met à disposition :
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs sm:text-sm text-gray-600">
              <li>
                <strong>Des formations 100 % gratuites :</strong> accessibles sans frais pour permettre à chacun de débuter son apprentissage.
              </li>
              <li>
                <strong>Des formations payantes :</strong> dont les tarifs sont clairement affichés sur les fiches des cours. L&apos;accès à ces formations est délivré après confirmation de paiement sécurisé via nos partenaires de paiement (FedaPay, Mobile Money et cartes bancaires).
              </li>
            </ul>
          </section>

          {/* Article 4 : Quiz et Certificats */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Article 4 — Évaluations & Certificats
            </h2>
            <p>
              Les formations peuvent inclure des quiz d&apos;évaluation. La réussite des quiz et la complétion intégrale des leçons donnent droit à la délivrance d&apos;un certificat numérique avec identifiant vérifiable.
            </p>
          </section>

          {/* Article 5 : Propriété intellectuelle */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Article 5 — Propriété intellectuelle et respect des cours
            </h2>
            <p>
              Les contenus de cours, vidéos, leçons, textes et exercices publiés sur la plateforme sont la propriété de leurs formateurs respectifs et de SkillUp.
            </p>
            <p>
              Il est formellement interdit de télécharger illicitement, reproduire, revendre ou diffuser les vidéos et contenus de formation en dehors du cadre de la plateforme.
            </p>
          </section>

          {/* Article 6 : Engagements des utilisateurs */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Article 6 — Engagements et bon usage
            </h2>
            <p>
              L&apos;utilisateur s&apos;engage à utiliser la plateforme dans le respect des lois en vigueur, sans porter atteinte aux autres membres ni tenter d&apos;altérer le fonctionnement technique du service.
            </p>
          </section>

          {/* Article 7 : Contact et Support */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Article 7 — Contact, assistance et réclamations
            </h2>
            <p>
              Pour toute question relative aux présentes CGU, à une formation ou à votre compte, vous pouvez nous joindre directement :
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#5C4DF5]" />
                <span>Email de contact : </span>
                <a href="mailto:camarayou360@gmail.com" className="font-semibold text-gray-900 underline">
                  camarayou360@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#5C4DF5]" />
                <span>Téléphone & WhatsApp : </span>
                <a href="https://wa.me/22890286347" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 underline">
                  +228 90 28 63 47
                </a>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
