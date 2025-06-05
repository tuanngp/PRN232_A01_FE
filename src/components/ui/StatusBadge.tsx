import { cn } from '@/lib/utils';
import { NewsStatus } from '@/types/api';

interface StatusBadgeProps {
  status: NewsStatus;
  className?: string;
  variant?: 'default' | 'modern' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function StatusBadge({ 
  status, 
  className,
  variant = 'modern',
  size = 'md',
  animated = true
}: StatusBadgeProps) {
  const isActive = status === NewsStatus.Active;
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const variants = {
    default: isActive 
      ? 'bg-green-100 text-green-700 border border-green-200' 
      : 'bg-gray-100 text-gray-700 border border-gray-200',
    modern: isActive
      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/50 shadow-sm'
      : 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200/50 shadow-sm',
    gradient: isActive
      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
      : 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg shadow-gray-500/25',
  };
  
  return (
    <span 
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-all duration-200',
        sizes[size],
        variants[variant],
        animated && 'hover:scale-105 hover:shadow-md',
        className
      )}
    >
      <span className={cn(
        'material-icons mr-1.5',
        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm',
        animated && isActive && 'animate-pulse'
      )}>
        {isActive ? 'check_circle' : 'pause_circle'}
      </span>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
} 