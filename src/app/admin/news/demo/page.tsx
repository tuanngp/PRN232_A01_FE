'use client';

import { StaffRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ArticlesTable } from '@/components/news/ArticlesTable';
import { mockArticles } from '@/components/news/MockArticlesData';
import { NewsArticle } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminNewsDemo() {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>(mockArticles);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setArticles(mockArticles);
      return;
    }

    const filtered = mockArticles.filter(article =>
      article.newsTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category?.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags?.some(tag => tag.tagName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setArticles(filtered);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleEdit = (article: NewsArticle) => {
    alert(`Editing article: ${article.newsTitle}`);
  };

  const handleDelete = (articleId: number) => {
    if (confirm('Are you sure you want to delete this article?')) {
      setArticles(prev => prev.filter(article => article.newsArticleId !== articleId));
    }
  };

  const handleCreateNew = () => {
    alert('Create new article functionality would be implemented here');
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

        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="material-icons text-blue-500">info</span>
            <span>
              This is a demo version using mock data. Showing {articles.length} of {mockArticles.length} articles.
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setArticles(mockArticles);
              }}
              className="text-blue-600 hover:text-blue-800 underline ml-2"
            >
              Reset
            </button>
          </div>
        </div>

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