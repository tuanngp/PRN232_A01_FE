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
            <th className="px-6 py-4 text-left text-black w-[35%] text-sm font-semibold uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-4 text-left text-black w-[15%] text-sm font-semibold uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-black w-[20%] text-sm font-semibold uppercase tracking-wider">
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
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <span className="material-icons text-4xl text-gray-300 mb-2">article</span>
                  <p>No articles found</p>
                </div>
              </td>
            </tr>
          ) : (
            articles.map((article) => (
              <tr key={article.newsArticleId} className="hover:bg-gray-50 transition-colors">
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
                  {article.tags && article.tags.length > 0 ? (
                    <TagChips tags={article.tags} maxTags={2} />
                  ) : (
                    <span className="text-gray-400 text-sm">No tags</span>
                  )}
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 