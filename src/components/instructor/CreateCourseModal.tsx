'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Loader2 } from 'lucide-react';
import type { CourseContentLevel, CoursePricingType } from '@/types/course';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Développement',
  'Design',
  'Marketing',
  'Business',
  'Finance',
  'Langues',
  'Sciences',
  'Musique',
  'Santé',
  'Autre',
];

const LEVELS: CourseContentLevel[] = ['Débutant', 'Intermédiaire', 'Avancé'];

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Développement');
  const [level, setLevel] = useState<CourseContentLevel>('Débutant');
  const [pricingType, setPricingType] = useState<CoursePricingType>('free');
  const [price, setPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setTitle('');
    setCategory('Développement');
    setLevel('Débutant');
    setPricingType('free');
    setPrice(0);
    setIsSubmitting(false);
    setErrorMessage(null);
  }, []);

  // Réinitialiser les champs à chaque ouverture de la modale
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (title.trim().length < 3) {
      setErrorMessage('Le titre doit contenir au moins 3 caractères.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/instructor/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          level,
          pricing_type: pricingType,
          price: pricingType === 'paid' ? price : 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Erreur lors de la création.');
        setIsSubmitting(false);
        return;
      }

      // Rediriger vers la page d'édition de la nouvelle formation
      if (data.course?.id) {
        router.push(`/formateur/formations/${data.course.id}`);
      }

      handleClose();
    } catch (err) {
      console.error('[CreateCourse] Erreur:', err);
      setErrorMessage('Une erreur inattendue est survenue.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Nouvelle formation</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-xs px-3 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre */}
          <div>
            <label htmlFor="course-title" className="block text-xs font-semibold text-gray-700 mb-1.5">
              Titre de la formation *
            </label>
            <input
              id="course-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Introduction au développement web"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] transition-all"
              autoFocus
            />
          </div>

          {/* Catégorie */}
          <div>
            <label htmlFor="course-category" className="block text-xs font-semibold text-gray-700 mb-1.5">
              Catégorie
            </label>
            <select
              id="course-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] transition-all bg-white cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Niveau */}
          <div>
            <label htmlFor="course-level" className="block text-xs font-semibold text-gray-700 mb-1.5">
              Niveau
            </label>
            <select
              id="course-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as CourseContentLevel)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] transition-all bg-white cursor-pointer"
            >
              {LEVELS.map((lv) => (
                <option key={lv} value={lv}>{lv}</option>
              ))}
            </select>
          </div>

          {/* Tarification */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Tarification
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPricingType('free')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  pricingType === 'free'
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                    : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                Gratuite
              </button>
              <button
                type="button"
                onClick={() => setPricingType('paid')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  pricingType === 'paid'
                    ? 'bg-[#EDE9FE] text-[#5C4DF5] border-2 border-[#5C4DF5]/30'
                    : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                Payante
              </button>
            </div>
          </div>

          {/* Prix (si payante) */}
          {pricingType === 'paid' && (
            <div>
              <label htmlFor="course-price" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Prix (XOF)
              </label>
              <input
                id="course-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="Ex : 5000"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] transition-all"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-sm cursor-pointer active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Création en cours…</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Créer en brouillon</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
