'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { NewsArticle, Category } from '@/types/api';
import { useNewsById } from '@/hooks/useNews';
import { newsService, categoryService } from '@/lib/api-services';

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

export default function ArticleDetailPage() {
  const params = useParams();
  const articleId = parseInt(params?.id as string);
  
  // Use the custom hook for fetching article data
  const { news: article, loading: articleLoading, error: articleError, refreshNews } = useNewsById(articleId);
  
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        setRelatedLoading(true);
        setGeneralError(null);
        
        // Fetch categories and related articles
        const [categoriesData, relatedData] = await Promise.all([
          categoryService.getActiveCategories(),
          article?.categoryId ? newsService.getNewsByCategory(article.categoryId, 1, 3) : Promise.resolve([])
        ]);
        
        setCategories(categoriesData);
        // Filter out the current article from related articles
        setRelatedArticles(relatedData.filter(a => a.newsArticleId !== articleId));
        
      } catch (err) {
        console.error('Failed to fetch additional data:', err);
        setGeneralError('Failed to load additional content');
      } finally {
        setRelatedLoading(false);
      }
    };

    if (article) {
      fetchAdditionalData();
    } else if (!articleLoading) {
      // Still fetch categories even if article fails
      categoryService.getActiveCategories()
        .then(setCategories)
        .catch(console.error);
    }
  }, [article, articleId, articleLoading]);

  if (articleLoading) {
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

          {/* Content skeleton */}
          <div className="px-10 md:px-20 lg:px-40 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="w-32 h-6 bg-slate-200 rounded mb-4"></div>
              <div className="w-full h-12 bg-slate-200 rounded mb-4"></div>
              <div className="w-3/4 h-6 bg-slate-200 rounded mb-8"></div>
              <div className="w-full h-96 bg-slate-200 rounded mb-8"></div>
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-full h-4 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (articleError || !article) {
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

        {/* Error Content */}
        <main className="px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-16">
          <div className="layout-content-container flex flex-col max-w-screen-lg flex-1 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Article Not Found</h1>
            <p className="text-slate-600 mb-8">
              {articleError || 'Sorry, the article you are looking for could not be found or may have been removed.'}
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
        <div className="layout-content-container flex flex-col max-w-4xl flex-1">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="text-slate-400">/</span>
            <Link href={`/category/${article.categoryId}`} className="hover:text-blue-600 transition-colors">
              {article.category?.categoryName || 'Uncategorized'}
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500 truncate">{article.newsTitle}</span>
          </nav>

          {/* Article Header */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            {/* Category and Meta Info */}
            <div className="p-6 pb-4">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {article.category?.categoryName || 'Uncategorized'}
                </span>
                <span className="text-slate-500 text-sm">{timeAgo(article.createdDate)}</span>
                {article.createdBy && (
                  <span className="text-slate-500 text-sm">By {article.createdBy.accountName}</span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
                {article.newsTitle}
              </h1>

              {/* Headline */}
              {article.headline && (
                <p className="text-xl text-slate-600 leading-relaxed mb-6 font-medium">
                  {article.headline}
                </p>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {article.tags.map((tag) => (
                    <span key={tag.tagId} className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full">
                      #{tag.tagName}
                    </span>
                  ))}
                </div>
              )}

              {/* Source */}
              {article.newsSource && (
                <p className="text-sm text-slate-500 italic mb-6">
                  Source: {article.newsSource}
                </p>
              )}
            </div>

            {/* Featured Image Placeholder */}
            <div className="w-full h-96 bg-gradient-to-r from-blue-400 to-purple-500 bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA7Fs6hHAL4O-2hCQ_LAl5HKujxEvQq0ix0Pt2HkIf4gWOkB8PfsstNDx0Rcghjlf8N7KpsCpsQ768v8aA6wg6fDL6W8S_gZkKFHcsB9w_Cwq9uhEux0lSdwGtjkiZ28KLH9C2UhqqS5DkEgDgBHW28M3aIqIMe_6pbhbXWvO3WDzZWWbxddRXIQv2jcG4blKjTHfozoQFXtHXAZwi_uO4BhBGsVG6WKwW2ObsqYQch453hEEgLAgjqsORyhQToM4uaEpmMpUXDYXI")'}}></div>

            {/* Article Content */}
            <div className="p-6 pt-8">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-headings:font-semibold prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:hover:text-blue-700 prose-strong:text-slate-900 prose-ul:text-slate-700 prose-ol:text-slate-700"
                dangerouslySetInnerHTML={{ __html: article.newsContent || '' }}
              />
            </div>

            {/* Article Footer */}
            <div className="p-6 pt-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <span className="material-icons text-lg">thumb_up</span>
                    <span>Like</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors">
                    <span className="material-icons text-lg">share</span>
                    <span>Share</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors">
                    <span className="material-icons text-lg">bookmark_border</span>
                    <span>Save</span>
                  </button>
                </div>
                <span className="text-sm text-slate-500">
                  Published {new Date(article.createdDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </article>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <article key={relatedArticle.newsArticleId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/article/${relatedArticle.newsArticleId}`}>
                      <div className="w-full h-48 bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA7Fs6hHAL4O-2hCQ_LAl5HKujxEvQq0ix0Pt2HkIf4gWOkB8PfsstNDx0Rcghjlf8N7KpsCpsQ768v8aA6wg6fDL6W8S_gZkKFHcsB9w_Cwq9uhEux0lSdwGtjkiZ28KLH9C2UhqqS5DkEgDgBHW28M3aIqIMe_6pbhbXWvO3WDzZWWbxddRXIQv2jcG4blKjTHfozoQFXtHXAZwi_uO4BhBGsVG6WKwW2ObsqYQch453hEEgLAgjqsORyhQToM4uaEpmMpUXDYXI")'}}></div>
                    </Link>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 hover:text-blue-600 transition-colors">
                        <Link href={`/article/${relatedArticle.newsArticleId}`}>
                          {relatedArticle.newsTitle}
                        </Link>
                      </h3>
                      {relatedArticle.headline && (
                        <p className="text-slate-600 text-sm line-clamp-2 mb-2">{relatedArticle.headline}</p>
                      )}
                      <span className="text-xs text-slate-500">{timeAgo(relatedArticle.createdDate)}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {relatedLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-slate-600 mt-2">Loading related articles...</p>
            </div>
          )}

          {generalError && (
            <div className="text-center py-8">
              <p className="text-red-600">{generalError}</p>
            </div>
          )}
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