import React from 'react';
import Link from 'next/link';
import { NewsArticle } from '@/types/api';
import { formatDate, generateExcerpt } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { Card, CardContent } from '@/components/ui/Card';

interface NewsCardProps {
  article: NewsArticle;
  variant?: 'default' | 'compact' | 'featured';
  showCategory?: boolean;
  showDate?: boolean;
  showExcerpt?: boolean;
  className?: string;
}

export function NewsCard({ 
  article, 
  variant = 'default', 
  showCategory = true, 
  showDate = true,
  showExcerpt = true,
  className = ''
}: NewsCardProps) {
  const excerpt = article.headline || (article.newsContent ? generateExcerpt(article.newsContent, 150) : '');

  if (variant === 'compact') {
    return (
      <Link href={ROUTES.ARTICLE(article.newsArticleId)} className={`block group ${className}`}>
        <div className="flex space-x-4 p-4 hover:bg-gray-50 transition-colors rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {article.newsTitle}
            </h3>
            {showDate && (
              <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                {showCategory && (
                  <>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {article.categoryName}
                    </span>
                    <span>•</span>
                  </>
                )}
                <time dateTime={article.createdDate}>
                  {formatDate(article.createdDate, 'relative')}
                </time>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={ROUTES.ARTICLE(article.newsArticleId)} className={`block group ${className}`}>
        <Card hover className="overflow-hidden">
          <div className="aspect-video bg-gray-100 relative">
            {/* Placeholder for image */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-12 h-12 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <CardContent className="p-6">
            {showCategory && (
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-3">
                {article.categoryName}
              </span>
            )}
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2">
              {article.newsTitle}
            </h2>
            {showExcerpt && excerpt && (
              <p className="text-gray-600 mb-4 line-clamp-3">
                {excerpt}
              </p>
            )}
            {showDate && (
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <time dateTime={article.createdDate}>
                  {formatDate(article.createdDate, 'long')}
                </time>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={ROUTES.ARTICLE(article.newsArticleId)} className={`block group ${className}`}>
      <Card hover className="h-full overflow-hidden">
        <div className="aspect-video bg-gray-100 relative">
          {/* Placeholder for image */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        
        <CardContent className="p-4">
          {showCategory && (
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mb-2">
              {article.categoryName}
            </span>
          )}
          
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
            {article.newsTitle}
          </h3>
          
          {showExcerpt && excerpt && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {excerpt}
            </p>
          )}
          
          {showDate && (
            <div className="flex items-center justify-between">
              <time dateTime={article.createdDate} className="text-xs text-gray-500">
                {formatDate(article.createdDate, 'relative')}
              </time>
              
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  {article.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.tagId}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {tag.tagName}
                    </span>
                  ))}
                  {article.tags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{article.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
} 