import { cn } from '@/lib/utils';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'minimal';
  glowColor?: 'blue' | 'purple' | 'pink' | 'green' | 'orange';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, padding = 'md', hover = false, variant = 'default', glowColor = 'blue' }, ref) => {
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const variants = {
      default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md',
      glass: 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl',
      gradient: `bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-lg`,
      elevated: 'bg-white border-0 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/60',
      minimal: 'bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-gray-200',
    };

    const glowStyles = {
      blue: 'hover:shadow-blue-500/20',
      purple: 'hover:shadow-purple-500/20',
      pink: 'hover:shadow-pink-500/20',
      green: 'hover:shadow-green-500/20',
      orange: 'hover:shadow-orange-500/20',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300 ease-out',
          paddingStyles[padding],
          variants[variant],
          hover && [
            'hover:scale-[1.02] hover:-translate-y-1 cursor-pointer',
            variant === 'elevated' && `hover:shadow-2xl ${glowStyles[glowColor]}`,
            variant === 'glass' && 'hover:bg-white/20 hover:border-white/30',
            variant === 'gradient' && 'hover:shadow-xl hover:shadow-gray-300/30',
          ],
          className
        )}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, gradient = false }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'space-y-2 pb-4',
        gradient && 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
        className
      )}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  gradient?: boolean;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className, size = 'md', gradient = false }, ref) => {
    const sizes = {
      sm: 'text-base font-semibold',
      md: 'text-lg font-semibold',
      lg: 'text-xl font-bold',
      xl: 'text-2xl font-bold',
    };

    return (
      <h3
        ref={ref}
        className={cn(
          'leading-none tracking-tight',
          sizes[size],
          gradient && 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
          className
        )}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'muted' | 'subtle';
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, variant = 'default' }, ref) => {
    const variants = {
      default: 'text-sm text-gray-600',
      muted: 'text-sm text-gray-500',
      subtle: 'text-xs text-gray-400 uppercase tracking-wide font-medium',
    };

    return (
      <p ref={ref} className={cn(variants[variant], className)}>
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className }, ref) => (
    <div ref={ref} className={cn('space-y-4', className)}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'gradient';
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, variant = 'default' }, ref) => {
    const variants = {
      default: 'flex items-center pt-4',
      bordered: 'flex items-center pt-4 border-t border-gray-100 mt-4',
      gradient: 'flex items-center pt-4 border-t border-gradient-to-r from-blue-200 to-purple-200 mt-4',
    };

    return (
      <div ref={ref} className={cn(variants[variant], className)}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
