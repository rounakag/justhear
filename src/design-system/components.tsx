import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { componentVariants, createVariantClass } from './index';
import type { ButtonProps, CardProps, ModalProps } from '@/types';

// Enhanced Button Component
export const Button = forwardRef<HTMLButtonElement, ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ 
    variant = 'default', 
    size = 'md', 
    disabled = false, 
    loading = false, 
    children, 
    className, 
    ...props 
  }, ref) => {
    const baseClass = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClass = createVariantClass(
      baseClass,
      componentVariants.button.variants,
      { variant, size }
    );

    return (
      <button
        ref={ref}
        className={cn(variantClass, className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Enhanced Card Component
export const Card = forwardRef<HTMLDivElement, CardProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ 
    variant = 'default', 
    padding = 'md', 
    children, 
    className, 
    onClick, 
    ...props 
  }, ref) => {
    const baseClass = 'rounded-xl transition-all duration-200';
    
    const variantClass = createVariantClass(
      baseClass,
      componentVariants.card.variants,
      { variant, padding }
    );

    return (
      <div
        ref={ref}
        className={cn(variantClass, onClick && 'cursor-pointer hover:shadow-md', className)}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Enhanced Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    label, 
    error, 
    helperText, 
    className, 
    ...props 
  }, ref) => {
    const baseClass = 'w-full rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClass = createVariantClass(
      baseClass,
      componentVariants.input.variants,
      { variant: error ? 'error' : variant, size }
    );

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(variantClass, className)}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Enhanced Modal Component
export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
      />
      
      {/* Modal Content */}
      <div className={cn(
        'relative bg-white rounded-xl shadow-xl w-full mx-4',
        sizeClasses[size]
      )}>
        {/* Header */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Badge Component
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  );
};

// Loading Spinner Component
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <svg 
      className={cn('animate-spin', sizeClasses[size], className)} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
      />
    </svg>
  );
};

// Container Component
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  maxWidth = 'xl',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8',
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
};

// Section Component
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'primary' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  background = 'white',
  padding = 'lg',
}) => {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    primary: 'bg-primary-50',
    gradient: 'bg-gradient-to-br from-blue-100 via-purple-50 to-yellow-100',
  };

  const paddingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16 md:py-20',
    xl: 'py-20 md:py-24',
  };

  return (
    <section className={cn(
      backgroundClasses[background],
      paddingClasses[padding],
      className
    )}>
      {children}
    </section>
  );
};
