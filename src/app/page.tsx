'use client';

import { useActiveCategories } from '@/hooks/useCategories';
import { useFeaturedNews, useLatestNews } from '@/hooks/useNews';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use the new hooks for data fetching
  const { news: latestNews, loading: newsLoading, error: newsError, refreshNews } = useLatestNews(12);
  const { categories, loading: categoriesLoading, error: categoriesError } = useActiveCategories();
  const { news: featuredNews, loading: featuredLoading, error: featuredError } = useFeaturedNews(5);

  // Auto-slide for hero banner
  useEffect(() => {
    if (featuredNews.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [featuredNews.length]);

  // Loading state
  const isLoading = newsLoading || categoriesLoading || featuredLoading;
  
  // Error state
  const hasError = newsError || categoriesError || featuredError;
  const errorMessage = newsError || categoriesError || featuredError;

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="bg-white border-b border-slate-200 px-10 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded"></div>
                <div className="w-32 h-6 bg-slate-200 rounded"></div>
              </div>
              <div className="flex gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-16 h-4 bg-slate-200 rounded"></div>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Hero skeleton */}
          <div className="px-10 md:px-20 lg:px-40 py-8">
            <div className="w-full h-96 bg-slate-200 rounded-xl mb-8"></div>
            
            {/* News grid skeleton */}
            <div className="mb-4 w-48 h-8 bg-slate-200 rounded"></div>
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
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Oops! Something went wrong</h2>
          <p className="text-slate-600 mb-6">{errorMessage}</p>
          <button 
            onClick={() => {
              refreshNews();
              window.location.reload();
            }} 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get current featured article or fallback
  const currentFeaturedNews = featuredNews[currentSlide] || {
    newsArticleId: 0,
    newsTitle: "Welcome to FU News",
    headline: "Stay informed with the latest news and updates from around the world. Our team brings you comprehensive coverage.",
    newsContent: "Stay informed with the latest news and updates from around the world. Our team brings you comprehensive coverage.",
    categoryId: 1,
    categoryName: "Featured",
    createdDate: new Date().toISOString(),
    newsStatus: 1,
    tags: []
  };

  return (
    <div className="bg-slate-50 min-h-screen" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-slate-200 bg-white px-10 py-4 shadow-sm">
        <div className="flex items-center gap-3 text-slate-900">
          <div className="text-2xl text-blue-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-slate-900 text-2xl font-bold leading-tight tracking-tight">FU News</h2>
        </div>
        
        <nav className="flex flex-1 justify-center">
          <ul className="flex items-center gap-8">
            <li><Link className="text-slate-700 hover:text-blue-600 text-base font-medium leading-normal transition-colors" href="/">Home</Link></li>
            {categories.map((category) => (
              <li key={category.categoryId}>
                <Link className="text-slate-700 hover:text-blue-600 text-base font-medium leading-normal transition-colors" href={`/category/${category.categoryId}`}>
                  {category.categoryName}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="flex items-center gap-3">
          <Link href="/search" aria-label="Search" className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-600 transition-colors">
            <span className="material-icons text-xl">search</span>
          </Link>
          <button aria-label="Bookmarks" className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-600 transition-colors">
            <span className="material-icons text-xl">bookmark_border</span>
          </button>
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-slate-200 hover:border-blue-500 transition-all" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDcD-GSt8Hsov6Ws0vEw54qAjzUkqNgjgy5QCk6lrfFbm1d1gXo3EpRpWg7VPffZEQ3sDsdvnOGRjIXxH9A1mBu64HiB3_SD6aIACyN-Dg2a-rvmsn1Y7uQkbBfm8-YjT6A7jIAWwyKk03veWY6J6m018UGdTpu3cNE9EAp1hqwwOg8qi9eOnsMSkWMI640WaZsWG5_cSnvEw8jrKXNikCwDq0ug3q25lLQ4wI1ZnuMbN3B_wpF8TjLKKqOwTG1NVt2nGrIQzySyEM")'}}></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-8">
        <div className="layout-content-container flex flex-col max-w-screen-lg flex-1">
          {/* Hero Banner */}
          <div className="w-full mb-8">
            <div className="relative bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-xl shadow-lg min-h-[400px] group" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD_VFXTzmjhTIBtts6hOHQqvCn5AH5TVvKBwWg529TPLZOl1EI60Ji_f4AUxoptptTIGkvOfR0uI0vLZ2Cf1asfXGCixi5lP68O6H12YlwyTl198R5JZpc-f3xjL7iDrd80C02844EyWjAP7XgEdd3A7W-fHn3Btfh9aLxRNYrHyS9BXKuZMD2KW93rMndONFZ1aTW6rPa6qPnj4TTCEjZh5hVfxKaW1Dl6f1EdeU9KybgY49LkdjZfNGFaxIKD_S47-zi0BxFeN_0")'}}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="relative p-8 text-white z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                    {currentFeaturedNews.category?.categoryName}
                  </span>
                  <span className="text-white/80 text-sm">
                    {timeAgo(currentFeaturedNews.createdDate)}
                  </span>
                </div>
                <Link href={`/article/${currentFeaturedNews.newsArticleId}`} className="block group-hover:text-blue-200 transition-colors">
                  <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                    {currentFeaturedNews.newsTitle}
                  </h1>
                  {currentFeaturedNews.headline && (
                    <p className="text-lg text-white/90 leading-relaxed max-w-3xl">
                      {currentFeaturedNews.headline}
                    </p>
                  )}
                </Link>
                {/* Slider indicators */}
                {featuredNews.length > 1 && (
                  <div className="flex gap-2 mt-6">
                    {featuredNews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentSlide ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Latest News Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 text-3xl font-bold leading-tight tracking-tight">Latest News</h2>
              <Link href="/search" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                View All
              </Link>
            </div>
            
            {latestNews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-400 text-6xl mb-4">📰</div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No News Available</h3>
                <p className="text-slate-500">Check back later for the latest updates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestNews.map((article) => (
                  <Link 
                    key={article.newsArticleId} 
                    href={`/article/${article.newsArticleId}`}
                    className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_VFXTzmjhTIBtts6hOHQqvCn5AH5TVvKBwWg529TPLZOl1EI60Ji_f4AUxoptptTIGkvOfR0uI0vLZ2Cf1asfXGCixi5lP68O6H12YlwyTl198R5JZpc-f3xjL7iDrd80C02844EyWjAP7XgEdd3A7W-fHn3Btfh9aLxRNYrHyS9BXKuZMD2KW93rMndONFZ1aTW6rPa6qPnj4TTCEjZh5hVfxKaW1Dl6f1EdeU9KybgY49LkdjZfNGFaxIKD_S47-zi0BxFeN_0" 
                        alt={article.newsTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/90 text-slate-700 text-xs font-medium rounded-full">
                          {article.categoryName}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-slate-900 text-lg font-semibold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.newsTitle}
                      </h3>
                      {article.headline && (
                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                          {article.headline}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{timeAgo(article.createdDate)}</span>
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex gap-1">
                            {article.tags.slice(0, 2).map((tag, index) => (
                              <span key={tag.tagId} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                                {tag.tagName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-10 py-8">
        <div className="max-w-screen-lg mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 text-slate-900 mb-4 md:mb-0">
              <div className="text-2xl text-blue-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="text-slate-900 text-xl font-bold">FU News</h2>
            </div>
            <div className="text-slate-600 text-sm">
              © 2024 FU News. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
