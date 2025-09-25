'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props },
    ref,
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

    const variantClasses = {
      primary:
        'bg-violet-600 text-white hover:bg-violet-700 disabled:bg-gray-300 disabled:text-gray-700',
      secondary:
        'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-xs rounded',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-lg',
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2
            className={cn(
              'animate-spin',
              size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5',
              children ? 'mr-2' : '',
            )}
          />
        )}
        {children}
      </button>
    );
  },
);

AppButton.displayName = 'AppButton';

export default AppButton;
