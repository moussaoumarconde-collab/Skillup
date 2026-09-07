import React from 'react';

export type BadgeVariant = 'popular' | 'free' | 'paid' | 'level' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon,
  className = '',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'popular':
        return 'bg-[#EDE9FE] text-[#5C4DF5] font-semibold text-xs px-2.5 py-0.5 rounded-full';
      case 'free':
      case 'paid':
        return 'bg-[#DCFCE7] text-[#16A34A] font-medium text-xs px-2.5 py-0.5 rounded-full';
      case 'level':
        return 'bg-gray-100 text-gray-600 font-medium text-xs px-2 py-0.5 rounded-md';
      case 'neutral':
      default:
        return 'bg-gray-100 text-gray-700 font-medium text-xs px-2.5 py-0.5 rounded-full';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 transition-colors ${getStyles()} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
