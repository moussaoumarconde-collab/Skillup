'use client';

import React from 'react';
import { FileEdit, Globe, Archive } from 'lucide-react';
import type { CoursePublicationStatus } from '@/types/course';

interface CourseStatusBadgeProps {
  status: CoursePublicationStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<CoursePublicationStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  text: string;
}> = {
  draft: {
    label: 'Brouillon',
    icon: FileEdit,
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  },
  published: {
    label: 'Publiée',
    icon: Globe,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  archived: {
    label: 'Archivée',
    icon: Archive,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
};

export const CourseStatusBadge: React.FC<CourseStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  const sizeClasses = size === 'md'
    ? 'px-3 py-1.5 text-xs gap-1.5'
    : 'px-2 py-1 text-[11px] gap-1';

  const iconSize = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';

  return (
    <span className={`inline-flex items-center font-semibold rounded-lg ${config.bg} ${config.text} ${sizeClasses}`}>
      <Icon className={iconSize} />
      {config.label}
    </span>
  );
};
