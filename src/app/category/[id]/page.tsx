'use client';

import { useActiveCategories, useCategoryById } from '@/hooks/useCategories';
import { useNewsByCategory } from '@/hooks/useNews';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

// Utility function to format time ago
const timeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString();
};

export default function CategoryPage() {
  const params = useParams();
  const categoryId = parseInt(params?.id as string);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Use hooks for data fetching
  const { categories, loading: categoriesLoading } = useActiveCategories();
  const { category: currentCategory, loading: categoryLoading, error: categoryError } = useCategoryById(categoryId);
  const {
    news: articles,
    loading: articlesLoading,
    error: articlesError,
    totalCount,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    refreshNews
  } = useNewsByCategory(categoryId, currentPage, 12);

  const isLoading = categoriesLoading || categoryLoading || articlesLoading;
  const hasError = categoryError || articlesError;

  if (isLoading) {
    return (
      <div className="bg-slate-50" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
        <div className="animate-pulse px-10 md:px-20 lg:px-40 py-8">
          <div className="mb-8">
            <div className="w-48 h-8 bg-slate-200 rounded mb-2"></div>
            <div className="w-96 h-4 bg-slate-200 rounded"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full h-48 bg-slate-200"></div>
                <div className="p-4 space-y-3">
                  <div className="w-full h-4 bg-slate-200 rounded"></div>
                  <div className="w-4/5 h-4 bg-slate-200 rounded"></div>
                  <div className="w-3/4 h-3 bg-slate-200 rounded"></div>
                  <div className="w-1/4 h-3 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !currentCategory) {
    return (
      <div className="bg-slate-50" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
        <main className="px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-16">
          <div className="layout-content-container flex flex-col max-w-screen-lg flex-1 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Category Not Found</h1>
            <p className="text-slate-600 mb-8">
              {hasError || 'Sorry, the category you are looking for could not be found.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={refreshNews}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <Link 
                href="/"
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-slate-50" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <main className="px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-8">
        <div className="layout-content-container flex flex-col max-w-screen-lg flex-1">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-600 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="material-icons text-xs">chevron_right</span>
            <span className="text-slate-900 font-medium">{currentCategory.categoryName}</span>
          </nav>

          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {currentCategory.categoryName}
            </h1>
            {currentCategory.categoryDescription && (
              <p className="text-xl text-slate-600 mb-6 leading-relaxed">
                {currentCategory.categoryDescription}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="material-icons text-lg">article</span>
                <span>{totalCount} articles</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-icons text-lg">category</span>
                <span>Category</span>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          {articles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-slate-400 text-2xl">article</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Articles Found</h3>
              <p className="text-slate-600 mb-6">There are no articles available in this category yet.</p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="material-icons">arrow_back</span>
                Back to Home
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {articles.map((article) => (
                  <Link
                    key={article.newsArticleId}
                    href={`/article/${article.newsArticleId}`}
                    className="group bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Featured Image Placeholder */}
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="material-icons text-white text-4xl">article</span>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {currentCategory.categoryName}
                        </span>
                        <span className="text-xs text-slate-500">{timeAgo(article.createdDate)}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.newsTitle}
                      </h3>
                      
                      {article.headline && (
                        <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                          {article.headline}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {article.createdBy && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="material-icons text-sm">person</span>
                            <span>{article.createdBy.accountName}</span>
                          </div>
                        )}
                        
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex gap-1">
                            {article.tags.slice(0, 2).map((tag) => (
                              <span 
                                key={tag.tagId}
                                className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs"
                              >
                                {tag.tagName}
                              </span>
                            ))}
                            {article.tags.length > 2 && (
                              <span className="text-xs text-slate-400">+{article.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={!hasPrevPage}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-icons text-lg">chevron_left</span>
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              page === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="text-slate-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={nextPage}
                    disabled={!hasNextPage}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <span className="material-icons text-lg">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
} 