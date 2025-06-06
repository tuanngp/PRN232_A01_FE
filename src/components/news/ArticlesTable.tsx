'use client';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { TagChips } from '@/components/ui/TagChip';
import { NewsArticle } from '@/types/api';

interface ArticlesTableProps {
  articles: NewsArticle[];
  onEdit: (article: NewsArticle) => void;
  onDelete: (articleId: number) => void;
  isLoading?: boolean;
}

export function ArticlesTable({ 
  articles, 
  onEdit, 
  onDelete, 
  isLoading = false 
}: ArticlesTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
        <div className="animate-pulse">
          <div className="bg-gray-50 h-16"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-gray-200 h-16 bg-gray-50"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white @container">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-black w-[10%] text-sm font-semibold uppercase tracking-wider">
              Image
            </th>
            <th className="px-6 py-4 text-left text-black w-[30%] text-sm font-semibold uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-4 text-left text-black w-[12%] text-sm font-semibold uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-black w-[18%] text-sm font-semibold uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-4 text-left text-black w-[20%] text-sm font-semibold uppercase tracking-wider">
              Tags
            </th>
            <th className="px-6 py-4 text-left text-black w-[10%] text-sm font-semibold uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {articles.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <span className="material-icons text-4xl text-gray-300 mb-2">article</span>
                  <p>No articles found</p>
                </div>
              </td>
            </tr>
          ) : (
            articles.map((article) => {
              // Debug: Log article structure for articles with tags
              if (article.newsArticleTags && (Array.isArray(article.newsArticleTags) || (article.newsArticleTags as any)?.$values)) {
                console.log(`Article ${article.newsArticleId} tags:`, article.newsArticleTags);
              }
              
              return (
              <tr key={article.newsArticleId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.newsTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {/* Fallback placeholder */}
                    <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${article.imageUrl ? 'hidden' : ''}`}>
                      <span className="material-icons text-gray-400 text-sm">image</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-black text-base font-medium">
                  <div className="max-w-xs truncate" title={article.newsTitle}>
                    {article.newsTitle}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={article.newsStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-base">
                  {article.category?.categoryName || 'No Category'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                                    {(() => {
                    // Handle case where newsArticleTags is undefined or null
                    if (!article.newsArticleTags) {
                      return <span className="text-gray-400 text-sm">No tags</span>;
                    }
                    
                    // Extract tags array from either direct array or $values structure
                    const tagsArray = Array.isArray(article.newsArticleTags) 
                      ? article.newsArticleTags 
                      : (article.newsArticleTags as any)?.$values;
                    
                    // Check if we have any tags
                    if (!tagsArray || !Array.isArray(tagsArray) || tagsArray.length === 0) {
                      return <span className="text-gray-400 text-sm">No tags</span>;
                    }
                    
                    // Extract tag objects and filter out nulls
                    const tags = tagsArray
                      .map((newsArticleTag: any) => newsArticleTag?.tag)
                      .filter((tag: any): tag is NonNullable<typeof tag> => tag != null);
                    
                    return tags.length > 0 ? (
                      <TagChips tags={tags} maxTags={2} />
                    ) : (
                      <span className="text-gray-400 text-sm">No tags</span>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(article)}
                      className="text-black hover:text-gray-700 transition-colors"
                      title="Edit"
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(article.newsArticleId)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
} 