'use client';

import { StaffRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ArticlesTable } from '@/components/news/ArticlesTable';
import { authService, newsService } from '@/lib/api-services';
import { NewsArticle } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminNewsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const currentUser = authService.getCurrentUser();
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use OData query to get active articles only (exclude deleted ones)
      const query = `$filter=IsDeleted eq false&CreatedId=${currentUser?.accountId}&$orderby=CreatedDate desc`;
      const data = await newsService.getNewsOData(query);
      setArticles(data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      setError('Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchArticles();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Search in title using OData, exclude deleted articles
      const query = `$expand=Category,NewsArticleTags($expand=Tag)&$filter=contains(tolower(NewsTitle), '${searchTerm.toLowerCase()}')&$orderby=CreatedDate desc`;
      const data = await newsService.getNewsOData(query);
      setArticles(data);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleEdit = (article: NewsArticle) => {
    router.push(`/admin/news/edit/${article.newsArticleId}`);
  };

  const handleDelete = async (articleId: number) => {
    if (!confirm('Are you sure you want to move this article to trash?')) {
      return;
    }

    try {
      // Import trashService
      const { trashService } = await import('@/lib/api-services');
      await trashService.softDeleteNews(articleId);
      await fetchArticles(); // Refresh the list
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to move article to trash. Please try again.');
    }
  };

  const handleCreateNew = () => {
    router.push('/admin/news/create');
  };

  return (
    <StaffRoute>
      <AdminLayout>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <p className="text-black text-4xl font-bold leading-tight">Articles</p>
          <button 
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-full h-10 px-6 bg-black text-white text-base font-medium leading-normal shadow-md hover:bg-gray-800 transition-colors"
          >
            <span className="material-icons">add_circle</span>
            <span className="truncate">New Article</span>
          </button>
        </div>

        <div className="mb-6">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-full h-full shadow-sm">
              <div className="text-gray-500 flex bg-gray-100 items-center justify-center pl-4 rounded-l-full border border-gray-200 border-r-0">
                <span className="material-icons">search</span>
              </div>
              <input 
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full text-black focus:outline-0 focus:ring-2 focus:ring-black focus:ring-opacity-50 border border-gray-200 bg-gray-100 focus:border-gray-200 h-full placeholder:text-gray-500 px-4 text-base font-normal leading-normal" 
                placeholder="Search articles by title, category, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleSearch}
                className="px-4 bg-gray-100 border border-gray-200 border-l-0 rounded-r-full hover:bg-gray-200 transition-colors"
                title="Search"
              >
                <span className="material-icons text-gray-500">search</span>
              </button>
            </div>
          </label>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons text-red-500 mr-2">error</span>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchArticles}
                className="ml-auto text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <ArticlesTable
          articles={articles}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={loading}
        />
      </AdminLayout>
    </StaffRoute>
  );
} 