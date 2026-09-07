'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'subtle-purple';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white shadow-sm';
      case 'secondary':
        return 'bg-[#EEEDFD] hover:bg-[#E3E0FD] text-[#5C4DF5]';
      case 'subtle-purple':
        return 'bg-[#F4F3FF] hover:bg-[#EDE9FE] text-[#5C4DF5]';
      case 'outline':
        return 'border border-gray-200 hover:bg-gray-50 text-gray-700';
      case 'ghost':
        return 'text-gray-600 hover:bg-gray-100';
      default:
        return 'bg-[#5C4DF5] text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-3 py-1.5 rounded-lg gap-1.5';
      case 'lg':
        return 'text-base px-6 py-3.5 rounded-xl gap-2.5 font-medium';
      case 'md':
      default:
        return 'text-sm px-4 py-2.5 rounded-xl gap-2 font-medium';
    }
  };

  return (
    <button
      className={`inline-flex items-center justify-center transition-all cursor-pointer font-medium active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${getVariantStyles()} ${getSizeStyles()} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
