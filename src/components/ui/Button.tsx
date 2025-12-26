import { cn } from '../../lib/utils';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'outline';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
          {
            'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-700': variant === 'primary',
            'bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-500 dark:bg-red-900': variant === 'danger',
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500': variant === 'outline',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';