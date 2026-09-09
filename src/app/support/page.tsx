'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Mail,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: 'Apprenant' | 'Formateur' | 'Paiement';
}

const FAQ_DATA: FaqItem[] = [
  {
    category: 'Apprenant',
    question: 'Comment accéder à mes formations et leçons ?',
    answer:
      'Une fois connecté, rendez-vous dans l’onglet « Formations » pour explorer le catalogue et vous inscrire à un cours. Vous retrouverez l’ensemble de vos cours dans l’onglet « Mes leçons » avec votre progression sauvegardée automatiquement.',
  },
  {
    category: 'Apprenant',
    question: 'Comment obtenir un certificat de réussite ?',
    answer:
      'Pour obtenir votre certificat officiel SkillUp, vous devez visionner l’ensemble des modules et leçons de la formation et réussir le quiz final avec une note d’au moins 70%. Votre certificat sera alors disponible dans votre espace Mon Compte.',
  },
  {
    category: 'Formateur',
    question: 'Comment puis-je créer et publier une formation ?',
    answer:
      'La création et la préparation des cours sont totalement gratuites dans l’Espace Formateur. Pour pouvoir publier officiellement votre cours auprès des apprenants, un abonnement formateur actif (mensuel ou annuel) est obligatoire.',
  },
  {
    category: 'Paiement',
    question: 'Quels sont les moyens de paiement acceptés ?',
    answer:
      'Les paiements sur SkillUp sont traités via la passerelle sécurisée FedaPay. Vous pouvez payer en toute sécurité par Mobile Money (MTN Mobile Money, Moov Money, Orange Money, Wave selon votre pays) ainsi que par carte bancaire (Visa, Mastercard).',
  },
  {
    category: 'Formateur',
    question: 'Comment le formateur reçoit-il ses revenus ?',
    answer:
      'Lorsqu’un élève achète votre cours, 100% du prix net est crédité sur votre portefeuille SkillUp. Vous pouvez renseigner votre compte Mobile Money de reversement dans l’Espace Formateur pour recevoir vos virements directs.',
  },
];

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Apprentissage');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitted(true);
    setTimeout(() => {
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="py-4 sm:py-6 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* En-tête */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#F0F2F6] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#5C4DF5] flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Centre d’aide & Support
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Une question ? Retrouvez les réponses fréquentes ou contactez notre équipe.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1 : FOIRE AUX QUESTIONS (FAQ) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#F0F2F6] shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
          <BookOpen className="w-5 h-5 text-[#5C4DF5]" />
          <h2 className="text-base font-bold text-gray-900">Questions fréquentes</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = expandedIndex === idx;
            return (
              <div key={idx} className="py-3.5">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-[#5C4DF5] px-2 py-0.5 rounded-md shrink-0">
                      {item.category}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">
                      {item.question}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <p className="mt-2.5 text-xs sm:text-sm text-gray-600 leading-relaxed pl-1 sm:pl-2">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2 : FORMULAIRE D'ASSISTANCE RÉEL */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#F0F2F6] shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
          <MessageSquare className="w-5 h-5 text-[#5C4DF5]" />
          <h2 className="text-base font-bold text-gray-900">Contacter le support</h2>
        </div>

        {isSubmitted ? (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-emerald-900">
              Message envoyé avec succès !
            </h3>
            <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto">
              Notre équipe d'assistance SkillUp a bien reçu votre demande. Vous recevrez une réponse dans les plus brefs délais par email.
            </p>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="mt-2 text-xs font-semibold text-emerald-800 underline cursor-pointer"
            >
              Envoyer une autre demande
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Type de demande</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] outline-none"
                >
                  <option value="Apprentissage">Apprentissage & Cours</option>
                  <option value="Abonnement">Formateur & Abonnement</option>
                  <option value="Paiement">Paiement FedaPay</option>
                  <option value="Technique">Problème technique</option>
                  <option value="Autre">Autre question</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Objet</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Question sur la publication d'un cours"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Votre message</label>
              <textarea
                required
                rows={4}
                placeholder="Décrivez votre situation ou votre question avec le plus de précisions possible..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] outline-none resize-y"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer le message</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Assistance directe */}
      <div className="bg-[#F8F9FC] border border-[#F0F2F6] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#5C4DF5] flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">Support direct par email</p>
            <p className="text-[11px] text-gray-500">support@skillup.com • Réponse sous 24h ouvrées</p>
          </div>
        </div>
        <a
          href="mailto:support@skillup.com"
          className="text-xs font-semibold text-[#5C4DF5] hover:underline"
        >
          Écrire directement
        </a>
      </div>
    </div>
  );
}
