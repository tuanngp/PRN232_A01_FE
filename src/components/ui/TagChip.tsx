import { cn } from '@/lib/utils';
import { Tag } from '@/types/api';

interface TagChipProps {
  tag: Tag;
  className?: string;
  variant?: 'default' | 'modern' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

const tagColors = [
  'bg-gradient-to-r from-blue-500 to-blue-600',
  'bg-gradient-to-r from-purple-500 to-purple-600',
  'bg-gradient-to-r from-pink-500 to-pink-600',
  'bg-gradient-to-r from-green-500 to-green-600',
  'bg-gradient-to-r from-orange-500 to-orange-600',
  'bg-gradient-to-r from-teal-500 to-teal-600',
  'bg-gradient-to-r from-indigo-500 to-indigo-600',
  'bg-gradient-to-r from-red-500 to-red-600',
];

export function TagChip({ 
  tag, 
  className,
  variant = 'modern',
  size = 'sm',
  onClick,
  removable = false,
  onRemove
}: TagChipProps) {
  const colorIndex = tag.tagId % tagColors.length;
  const gradientColor = tagColors[colorIndex];

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const variants = {
    default: 'bg-gray-200 text-gray-700',
    modern: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300/50 shadow-sm',
    gradient: `${gradientColor} text-white shadow-lg shadow-gray-500/25`,
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center font-semibold rounded-full transition-all duration-200 mr-2',
        sizes[size],
        variants[variant],
        onClick && 'cursor-pointer hover:scale-105 hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {tag.tagName}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
}

interface TagChipsProps {
  tags: Tag[];
  maxTags?: number;
  className?: string;
  variant?: 'default' | 'modern' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onTagClick?: (tag: Tag) => void;
}

export function TagChips({ 
  tags, 
  maxTags = 3, 
  className,
  variant = 'gradient',
  size = 'sm',
  onTagClick
}: TagChipsProps) {
  const displayTags = tags.slice(0, maxTags);
  const remainingCount = tags.length - maxTags;
  
  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {displayTags.map((tag) => (
        <TagChip 
          key={tag.tagId} 
          tag={tag} 
          variant={variant}
          size={size}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
        />
      ))}
      {remainingCount > 0 && (
        <span 
          className={cn(
            'inline-flex items-center font-semibold rounded-full transition-all duration-200',
            'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm',
            size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 
            size === 'lg' ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-sm'
          )}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
} 