import { cn } from '@/lib/utils';
import React, { useState } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'floating' | 'filled' | 'glass';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    variant = 'default', 
    icon, 
    iconPosition = 'left',
    size = 'md',
    id,
    value,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-4 text-sm',
      lg: 'h-12 px-5 text-base',
    };

    const baseStyles = 'w-full rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50';

    const variants = {
      default: cn(
        'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500',
        'focus:border-blue-500 focus:ring-blue-500/20',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
      ),
      floating: cn(
        'border-gray-300 bg-white text-gray-900 placeholder:text-transparent',
        'focus:border-blue-500 focus:ring-blue-500/20',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
      ),
      filled: cn(
        'border-0 bg-gray-100 text-gray-900 placeholder:text-gray-500',
        'focus:bg-white focus:ring-blue-500/20 focus:border-blue-500 focus:border',
        error && 'bg-red-50 focus:border-red-500 focus:ring-red-500/20',
      ),
      glass: cn(
        'border-white/20 bg-white/10 backdrop-blur-lg text-white placeholder:text-white/60',
        'focus:border-white/40 focus:ring-white/20 focus:bg-white/20',
      ),
    };

    const iconStyles = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    if (variant === 'floating' && label) {
      return (
        <div className="relative">
          <div className="relative">
            {icon && iconPosition === 'left' && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <div className={iconStyles[size]}>{icon}</div>
              </div>
            )}
            
            <input
              ref={ref}
              id={inputId}
              className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                icon && iconPosition === 'left' && 'pl-10',
                icon && iconPosition === 'right' && 'pr-10',
                className
              )}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              value={value}
              {...props}
            />
            
            <label
              htmlFor={inputId}
              className={cn(
                'absolute left-4 transition-all duration-200 pointer-events-none',
                'text-gray-500 bg-white px-1',
                icon && iconPosition === 'left' && 'left-10',
                (isFocused || hasValue || value) 
                  ? '-top-2 text-xs text-blue-600 font-medium' 
                  : 'top-1/2 -translate-y-1/2 text-sm',
                error && (isFocused || hasValue || value) && 'text-red-600'
              )}
            >
              {label}
            </label>

            {icon && iconPosition === 'right' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <div className={iconStyles[size]}>{icon}</div>
              </div>
            )}
          </div>

          {(error || helperText) && (
            <div className="mt-2 space-y-1">
              {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              )}
              {helperText && !error && (
                <p className="text-sm text-gray-500">{helperText}</p>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <div className={iconStyles[size]}>{icon}</div>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseStyles,
              variants[variant],
              sizes[size],
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            value={value}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <div className={iconStyles[size]}>{icon}</div>
            </div>
          )}
        </div>

        {(error || helperText) && (
          <div className="space-y-1">
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
