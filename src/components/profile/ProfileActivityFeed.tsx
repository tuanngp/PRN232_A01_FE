'use client';

import { newsService } from '@/lib/api-services';
import { NewsArticle, SystemAccount } from '@/types/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ProfileActivityFeedProps {
  profile: SystemAccount;
}

export function ProfileActivityFeed({ profile }: ProfileActivityFeedProps) {
  const [activities, setActivities] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserActivities();
  }, [profile.accountId]);

  const fetchUserActivities = async () => {
    try {
      setIsLoading(true);
      // Get articles created by this user
      const query = `$filter=CreatedBy/AccountId eq ${profile.accountId}&$orderby=CreatedDate desc&$top=10&$expand=Category`;
      const userArticles = await newsService.getNewsOData(query);
      setActivities(userArticles);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (status: number) => {
    return status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: number) => {
    return status === 1 ? 'Active' : 'Inactive';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <span className="material-icons text-gray-400 text-4xl mb-2">error</span>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={fetchUserActivities}
            className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-icons text-gray-400 text-4xl mb-2">article</span>
          <p className="text-gray-500">No articles created yet</p>
          <p className="text-sm text-gray-400 mt-1">Start writing to see your activity here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((article) => (
            <div key={article.newsArticleId} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-blue-600 text-lg">article</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link 
                      href={`/article/${article.newsArticleId}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {article.newsTitle}
                    </Link>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        Created {formatDate(article.createdDate)}
                      </span>
                      {article.category && (
                        <>
                          <span className="text-xs text-gray-300">•</span>
                          <Link 
                            href={`/category/${article.category.categoryId}`}
                            className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {article.category.categoryName}
                          </Link>
                        </>
                      )}
                    </div>
                    
                    {article.headline && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {article.headline}
                      </p>
                    )}
                  </div>
                  
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(article.newsStatus)}`}>
                    {getStatusText(article.newsStatus)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {activities.length >= 10 && (
            <div className="text-center pt-4 border-t border-gray-100">
              <Link 
                href="/admin/news"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all articles →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 