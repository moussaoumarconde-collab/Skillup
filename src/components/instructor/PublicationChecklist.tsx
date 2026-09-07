'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { CoursePublicationValidationResult } from '@/types/course';

interface PublicationChecklistProps {
  validation: CoursePublicationValidationResult;
}

interface CheckItemProps {
  label: string;
  passed: boolean;
  detail?: string;
}

const CheckItem: React.FC<CheckItemProps> = ({ label, passed, detail }) => (
  <div className="flex items-start gap-2.5 py-2">
    {passed ? (
      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
    ) : (
      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
    )}
    <div className="min-w-0">
      <p className={`text-xs font-medium ${passed ? 'text-gray-700' : 'text-red-600'}`}>
        {label}
      </p>
      {detail && (
        <p className="text-[11px] text-gray-400 mt-0.5">{detail}</p>
      )}
    </div>
  </div>
);

export const PublicationChecklist: React.FC<PublicationChecklistProps> = ({ validation }) => {
  const { checks } = validation;

  return (
    <div className="space-y-0 divide-y divide-gray-100">
      <CheckItem
        label="Titre (minimum 3 caractères)"
        passed={checks.hasTitle}
      />
      <CheckItem
        label="Description (minimum 10 caractères)"
        passed={checks.hasDescription}
      />
      <CheckItem
        label="Catégorie renseignée"
        passed={checks.hasCategory}
      />
      <CheckItem
        label="Prix valide (gratuit ou prix > 0 XOF)"
        passed={checks.hasValidPrice}
      />
      <CheckItem
        label="Abonnement formateur actif"
        passed={checks.hasActiveSubscription}
      />
      <CheckItem
        label={`Modules (${checks.modulesCount} module${checks.modulesCount > 1 ? 's' : ''})`}
        passed={checks.hasModules && checks.hasAllModulesWithLessons}
        detail={!checks.hasModules ? 'Minimum 1 module requis' : (!checks.hasAllModulesWithLessons ? 'Chaque module doit contenir au moins 1 leçon' : undefined)}
      />
      <CheckItem
        label={`Leçons (${checks.lessonsCount} leçon${checks.lessonsCount > 1 ? 's' : ''})`}
        passed={checks.hasLessons && checks.hasAllLessonsWithContent}
        detail={!checks.hasLessons ? 'Minimum 1 leçon requise' : (!checks.hasAllLessonsWithContent ? 'Chaque leçon doit comporter une vidéo ou du texte' : undefined)}
      />
    </div>
  );
};
