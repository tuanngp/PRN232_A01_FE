import { Tag } from '@/types/api';

interface TagChipProps {
  tag: Tag;
  className?: string;
}

export function TagChip({ tag, className = '' }: TagChipProps) {
  return (
    <span 
      className={`
        inline-block bg-gray-200 text-gray-700 text-xs font-semibold 
        mr-2 px-2.5 py-0.5 rounded-full
        ${className}
      `}
    >
      {tag.tagName}
    </span>
  );
}

interface TagChipsProps {
  tags: Tag[];
  maxTags?: number;
  className?: string;
}

export function TagChips({ tags, maxTags = 2, className = '' }: TagChipsProps) {
  const displayTags = tags.slice(0, maxTags);
  const remainingCount = tags.length - maxTags;
  
  return (
    <div className={`flex flex-wrap items-center ${className}`}>
      {displayTags.map((tag) => (
        <TagChip key={tag.tagId} tag={tag} />
      ))}
      {remainingCount > 0 && (
        <span className="inline-block bg-gray-200 text-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
} 