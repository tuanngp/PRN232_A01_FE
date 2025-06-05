'use client';

import { useNewsById } from '@/hooks/useNews';
import { categoryService, newsService } from '@/lib/api-services';
import { Category, NewsArticle } from '@/types/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
      <div className="bg-slate-50" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
        <div className="animate-pulse px-10 md:px-20 lg:px-40 py-8">
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
    );
  }

  if (articleError || !article) {
    return (
      <div className="bg-slate-50" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
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
    <div className="bg-slate-50" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <main className="px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-8">
        <div className="layout-content-container flex flex-col max-w-screen-lg flex-1">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-600 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="material-icons text-xs">chevron_right</span>
            {article.category && (
              <>
                <Link 
                  href={`/category/${article.categoryId}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {article.category.categoryName}
                </Link>
                <span className="material-icons text-xs">chevron_right</span>
              </>
            )}
            <span className="text-slate-900 font-medium line-clamp-1">{article.newsTitle}</span>
          </nav>

          {/* Article Header */}
          <div className="mb-8">
            {article.category && (
              <Link
                href={`/category/${article.categoryId}`}
                className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors mb-4"
              >
                {article.category.categoryName}
              </Link>
            )}
            
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
              {article.newsTitle}
            </h1>
            
            {article.headline && (
              <p className="text-xl text-slate-600 mb-6 leading-relaxed">
                {article.headline}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-slate-500 border-b border-slate-200 pb-6">
              <div className="flex items-center gap-2">
                <span className="material-icons text-lg">schedule</span>
                <span>{timeAgo(article.createdDate)}</span>
              </div>
              
              {article.createdBy && (
                <div className="flex items-center gap-2">
                  <span className="material-icons text-lg">person</span>
                  <span>By {article.createdBy.accountName}</span>
                </div>
              )}
              
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="material-icons text-lg">local_offer</span>
                  <div className="flex gap-2">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag.tagId}
                        className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs"
                      >
                        {tag.tagName}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-slate-400">+{article.tags.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Article Content */}
          <div className="mb-12">
            <div 
              className="prose prose-lg max-w-none prose-slate prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-blockquote:text-slate-600 prose-blockquote:border-blue-200"
              dangerouslySetInnerHTML={{ __html: article.newsContent }}
            />
          </div>

          {/* Article Actions */}
          <div className="flex items-center justify-between py-6 border-y border-slate-200 mb-12">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <span className="material-icons">thumb_up</span>
                <span>Like</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <span className="material-icons">bookmark_border</span>
                <span>Save</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <span className="material-icons">share</span>
                <span>Share</span>
              </button>
            </div>
            
            <div className="text-sm text-slate-500">
              Article ID: {article.newsArticleId}
            </div>
          </div>

          {/* Related Articles */}
          {!relatedLoading && relatedArticles.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.newsArticleId}
                    href={`/article/${relatedArticle.newsArticleId}`}
                    className="group bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-6">
                      {relatedArticle.category && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded mb-3">
                          {relatedArticle.category.categoryName}
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedArticle.newsTitle}
                      </h3>
                      {relatedArticle.headline && (
                        <p className="text-slate-600 text-sm line-clamp-3 mb-3">
                          {relatedArticle.headline}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="material-icons text-sm">schedule</span>
                        <span>{timeAgo(relatedArticle.createdDate)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to Category */}
          {article.category && (
            <div className="text-center">
              <Link
                href={`/category/${article.categoryId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="material-icons">arrow_back</span>
                Back to {article.category.categoryName}
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 