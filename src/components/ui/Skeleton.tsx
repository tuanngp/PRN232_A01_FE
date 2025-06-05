import { cn } from '@/lib/utils';
import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'title' | 'image' | 'avatar' | 'button';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'default', 
    width, 
    height, 
    lines = 1, 
    animated = true 
  }, ref) => {
    const baseStyles = cn(
      'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg',
      animated && 'animate-pulse bg-[length:200%_100%]'
    );

    const variants = {
      default: 'h-4',
      text: 'h-4 mb-2',
      title: 'h-6 mb-3',
      image: 'aspect-video rounded-xl',
      avatar: 'w-12 h-12 rounded-full',
      button: 'h-10 w-24 rounded-xl',
    };

    const style = {
      width: width,
      height: variant === 'default' ? height : undefined,
    };

    if (lines > 1 && (variant === 'text' || variant === 'default')) {
      return (
        <div ref={ref} className={cn('space-y-2', className)}>
          {Array.from({ length: lines }, (_, i) => (
            <div
              key={i}
              className={cn(
                baseStyles,
                variants[variant],
                i === lines - 1 && 'w-3/4' // Last line shorter
              )}
              style={style}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        style={style}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Pre-built skeleton patterns
const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('p-6 bg-white rounded-2xl border border-gray-200', className)}>
    <div className="space-y-4">
      <Skeleton variant="image" />
      <div className="space-y-2">
        <Skeleton variant="title" width="80%" />
        <Skeleton variant="text" lines={2} />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="text" width="60px" />
        <Skeleton variant="avatar" />
      </div>
    </div>
  </div>
);

const SkeletonArticle = ({ className }: { className?: string }) => (
  <div className={cn('space-y-4', className)}>
    <Skeleton variant="title" />
    <div className="flex items-center gap-4">
      <Skeleton variant="avatar" />
      <div className="space-y-1 flex-1">
        <Skeleton variant="text" width="120px" />
        <Skeleton variant="text" width="80px" />
      </div>
    </div>
    <Skeleton variant="image" />
    <Skeleton variant="text" lines={3} />
    <div className="flex gap-2">
      <Skeleton variant="button" width="80px" />
      <Skeleton variant="button" width="100px" />
    </div>
  </div>
);

const SkeletonList = ({ 
  items = 3, 
  className 
}: { 
  items?: number; 
  className?: string; 
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" width="70%" />
          <Skeleton variant="text" width="90%" />
        </div>
        <Skeleton variant="button" />
      </div>
    ))}
  </div>
);

const SkeletonTable = ({ 
  rows = 5, 
  columns = 4, 
  className 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) => (
  <div className={cn('bg-white rounded-xl border border-gray-200 overflow-hidden', className)}>
    {/* Header */}
    <div className="border-b border-gray-200 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} variant="text" width="80%" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton key={colIndex} variant="text" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export {
    Skeleton, SkeletonArticle, SkeletonCard, SkeletonList,
    SkeletonTable
};
