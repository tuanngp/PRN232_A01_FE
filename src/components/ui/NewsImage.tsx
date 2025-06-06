import { useState } from 'react';

interface NewsImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  showPlaceholder?: boolean;
}

export function NewsImage({ 
  src, 
  alt, 
  className = "w-full h-full object-cover",
  fallbackClassName = "w-full h-full bg-gray-200 flex items-center justify-center",
  showPlaceholder = true 
}: NewsImageProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (!src || imageError) {
    return showPlaceholder ? (
      <div className={fallbackClassName}>
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    ) : null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
} 