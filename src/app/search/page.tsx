'use client';

import { useNewsSearch } from '@/hooks/useNews';
import { categoryService } from '@/lib/api-services';
import { Category } from '@/types/api';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface SearchFilters {
  category?: number;
  sortBy?: 'date' | 'relevance';
  dateRange?: 'all' | 'week' | 'month' | 'year';
}

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

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams?.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    dateRange: 'all'
  });
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Use the search hook with the current query
  const {
    news: results,
    loading,
    error: searchError,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage
  } = useNewsSearch(query, 300, 1, 12);

  const searchPerformed = query.trim().length > 0;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setGeneralError(null);
        const categoriesData = await categoryService.getActiveCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setGeneralError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Update URL when query changes
    if (query !== initialQuery) {
      const url = new URL(window.location.href);
      if (query.trim()) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [query, router, initialQuery]);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    // Note: For now, we'll implement client-side filtering
    // In a real implementation, you'd want to pass these filters to the API
  };

  const highlightSearchTerm = (text: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  // Filter results by category if category filter is applied
  const filteredResults = filters.category 
    ? results.filter(article => article.categoryId === filters.category)
    : results;

  const displayError = searchError || generalError;

  return (
    <div className="bg-slate-50 min-h-screen" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>

      {/* Main Content */}
      <main className="px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-8">
        <div className="layout-content-container flex flex-col max-w-screen-lg flex-1">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Search News</h1>
            
            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search for news articles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-6 py-4 text-lg bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <span className="material-icons absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-2xl">
                search
              </span>
            </div>

            {/* Search Filters */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Category:</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange({ category: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as 'date' | 'relevance' })}
                  className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Date:</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange({ dateRange: e.target.value as 'all' | 'week' | 'month' | 'year' })}
                  className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="min-h-[400px]">
            {/* Results Header */}
            {searchPerformed && (
              <div className="flex items-center justify-between mb-6">
                <div>
                  {loading ? (
                    <p className="text-slate-600">Searching...</p>
                  ) : (
                    <p className="text-slate-600">
                      {totalCount === 0 ? 'No results' : 
                       totalCount === 1 ? '1 result' : 
                       `${totalCount.toLocaleString()} results`} 
                      {query && ` for "${query}"`}
                    </p>
                  )}
                </div>
                {totalPages > 1 && (
                  <p className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                  </p>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-600">Searching articles...</p>
              </div>
            )}

            {/* Error State */}
            {displayError && !loading && (
              <div className="text-center py-16">
                <div className="text-red-500 mb-4">
                  <span className="material-icons text-4xl">error_outline</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Search Error</h3>
                <p className="text-slate-600 mb-4">{displayError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* No Results */}
            {searchPerformed && !loading && !displayError && filteredResults.length === 0 && (
              <div className="text-center py-16">
                <div className="text-slate-400 mb-4">
                  <span className="material-icons text-6xl">search_off</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No Results Found</h3>
                <p className="text-slate-600 mb-4">
                  We couldn't find any articles matching "{query}". Try different keywords or check your spelling.
                </p>
                <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
                  <p>Suggestions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use different keywords</li>
                    <li>Check spelling</li>
                    <li>Try broader search terms</li>
                    <li>Remove category filters</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Search Instructions */}
            {!searchPerformed && !loading && (
              <div className="text-center py-16">
                <div className="text-slate-400 mb-4">
                  <span className="material-icons text-6xl">search</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Search FU News</h3>
                <p className="text-slate-600 mb-4">
                  Enter keywords in the search box above to find news articles.
                </p>
                <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
                  <p>You can search for:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Article titles and headlines</li>
                    <li>Article content</li>
                    <li>Author names</li>
                    <li>Topics and keywords</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Search Results */}
            {!loading && !displayError && filteredResults.length > 0 && (
              <>
                <div className="space-y-6">
                  {filteredResults.map((article) => (
                    <article key={article.newsArticleId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow p-6">
                      <div className="flex items-start gap-4">
                        {/* Article Image */}
                        <Link href={`/article/${article.newsArticleId}`} className="flex-shrink-0">
                          <div 
                            className="w-32 h-24 bg-cover bg-center rounded-lg" 
                            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA7Fs6hHAL4O-2hCQ_LAl5HKujxEvQq0ix0Pt2HkIf4gWOkB8PfsstNDx0Rcghjlf8N7KpsCpsQ768v8aA6wg6fDL6W8S_gZkKFHcsB9w_Cwq9uhEux0lSdwGtjkiZ28KLH9C2UhqqS5DkEgDgBHW28M3aIqIMe_6pbhbXWvO3WDzZWWbxddRXIQv2jcG4blKjTHfozoQFXtHXAZwi_uO4BhBGsVG6WKwW2ObsqYQch453hEEgLAgjqsORyhQToM4uaEpmMpUXDYXI")'}}
                          ></div>
                        </Link>
                        
                        {/* Article Content */}
                        <div className="flex-1 min-w-0">
                          {/* Meta Information */}
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                              {article.category?.categoryName}
                            </span>
                            <span className="text-xs text-slate-500">
                              {timeAgo(article.createdDate)}
                            </span>
                          </div>
                          
                          {/* Title */}
                          <h3 className="text-xl font-semibold text-slate-900 mb-2 hover:text-blue-600 transition-colors">
                            <Link 
                              href={`/article/${article.newsArticleId}`}
                              dangerouslySetInnerHTML={{ __html: highlightSearchTerm(article.newsTitle) }}
                            />
                          </h3>
                          
                          {/* Headline */}
                          {article.headline && (
                            <p 
                              className="text-slate-600 text-sm mb-2 line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: highlightSearchTerm(article.headline) }}
                            />
                          )}
                          
                          {/* Tags */}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {article.tags.slice(0, 3).map((tag) => (
                                <span key={tag.tagId} className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                  #{tag.tagName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={prevPage}
                      disabled={!hasPrevPage}
                      className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-icons text-lg mr-1">chevron_left</span>
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        const isActive = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={nextPage}
                      disabled={!hasNextPage}
                      className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <span className="material-icons text-lg ml-1">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300">
        <div className="max-w-screen-lg mx-auto px-5 py-12">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mb-8 text-center">
            <Link className="text-slate-300 hover:text-blue-400 text-sm font-normal leading-normal min-w-40 transition-colors" href="/about">About Us</Link>
            <Link className="text-slate-300 hover:text-blue-400 text-sm font-normal leading-normal min-w-40 transition-colors" href="/contact">Contact</Link>
            <Link className="text-slate-300 hover:text-blue-400 text-sm font-normal leading-normal min-w-40 transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="text-slate-300 hover:text-blue-400 text-sm font-normal leading-normal min-w-40 transition-colors" href="/terms">Terms of Service</Link>
          </div>
          <div className="flex justify-center items-center gap-4 mb-8">
            <Link className="text-slate-400 hover:text-blue-400 transition-colors" href="#">
              <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd"></path>
              </svg>
            </Link>
            <Link className="text-slate-400 hover:text-blue-400 transition-colors" href="#">
              <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </Link>
            <Link className="text-slate-400 hover:text-blue-400 transition-colors" href="#">
              <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.927 8.177c.05.261.073.53.073.806 0 4.51-3.445 9.712-9.712 9.712A9.67 9.67 0 012.5 19.15a7.112 7.112 0 00.826.096c1.625 0 3.128-.553 4.343-1.496a3.415 3.415 0 01-3.191-2.362 3.506 3.506 0 001.532-.058 3.416 3.416 0 01-2.738-3.35v-.043a3.401 3.401 0 001.54.426 3.416 3.416 0 01-1.048-4.55 9.695 9.695 0 007.032 3.565 3.415 3.415 0 015.808-3.108A6.818 6.818 0 0020.05 7.3a3.427 3.427 0 01-1.442 1.963 6.745 6.745 0 001.99-.536 7.074 7.074 0 01-1.671 1.84z" fillRule="evenodd"></path>
              </svg>
            </Link>
          </div>
          <p className="text-slate-400 text-sm font-normal leading-normal text-center">© 2024 FU News. All rights reserved. A brighter way to stay informed.</p>
        </div>
      </footer>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
} 