import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ 
    title, 
    description, 
    variant = 'default', 
    duration = 5000, 
    onClose,
    action,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onClose?.();
          }, 150); // Wait for animation to complete
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    const variants = {
      default: {
        bg: 'bg-white border-gray-200',
        icon: '📄',
        iconColor: 'text-gray-600',
      },
      success: {
        bg: 'bg-white border-green-200',
        icon: '✅',
        iconColor: 'text-green-600',
      },
      error: {
        bg: 'bg-white border-red-200',
        icon: '❌',
        iconColor: 'text-red-600',
      },
      warning: {
        bg: 'bg-white border-orange-200',
        icon: '⚠️',
        iconColor: 'text-orange-600',
      },
      info: {
        bg: 'bg-white border-blue-200',
        icon: 'ℹ️',
        iconColor: 'text-blue-600',
      },
    };

    const variantStyles = variants[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border shadow-lg',
          'transform transition-all duration-300 ease-out',
          isVisible 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95',
          variantStyles.bg
        )}
        {...props}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className={cn('text-lg', variantStyles.iconColor)}>
                {variantStyles.icon}
              </div>
            </div>
            
            <div className="ml-3 w-0 flex-1">
              {title && (
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {title}
                </p>
              )}
              {description && (
                <p className="text-sm text-gray-600">
                  {description}
                </p>
              )}
              
              {action && (
                <div className="mt-3">
                  <button
                    onClick={action.onClick}
                    className={cn(
                      'text-sm font-medium px-3 py-1 rounded-lg transition-colors',
                      'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                      variantStyles.iconColor
                    )}
                  >
                    {action.label}
                  </button>
                </div>
              )}
            </div>
            
            <div className="ml-4 flex flex-shrink-0">
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => {
                    onClose?.();
                  }, 150);
                }}
                className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        {duration > 0 && (
          <div className="h-1 bg-gray-100">
            <div 
              className={cn(
                'h-full transition-all ease-linear',
                variant === 'success' && 'bg-green-500',
                variant === 'error' && 'bg-red-500',
                variant === 'warning' && 'bg-orange-500',
                variant === 'info' && 'bg-blue-500',
                variant === 'default' && 'bg-gray-500'
              )}
              style={{
                animation: `progress ${duration}ms linear`,
              }}
            />
          </div>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

// Toast Container
interface ToastContainerProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastContainer = ({ children, position = 'top-right' }: ToastContainerProps) => {
  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div className={cn('fixed z-50 pointer-events-none', positions[position])}>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

export { Toast, ToastContainer };
