'use client';

import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { accountService, categoryService, newsService, tagService } from '@/lib/api-services';
import { AccountRole, NewsArticle, NewsStatus } from '@/types/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalArticles: number;
  activeArticles: number;
  inactiveArticles: number;
  totalCategories: number;
  activeCategories: number;
  totalTags: number;
  totalAccounts: number;
  activeAccounts: number;
  adminCount: number;
  staffCount: number;
  lecturerCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    activeArticles: 0,
    inactiveArticles: 0,
    totalCategories: 0,
    activeCategories: 0,
    totalTags: 0,
    totalAccounts: 0,
    activeAccounts: 0,
    adminCount: 0,
    staffCount: 0,
    lecturerCount: 0
  });
  const [recentArticles, setRecentArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [articles, categories, tags, accounts] = await Promise.all([
        newsService.getAllNews(),
        categoryService.getAllCategories(),
        tagService.getAllTags(),
        accountService.getAllAccounts()
      ]);

      // Calculate statistics
      const dashboardStats: DashboardStats = {
        totalArticles: articles.length,
        activeArticles: articles.filter(a => a.newsStatus === NewsStatus.Active).length,
        inactiveArticles: articles.filter(a => a.newsStatus === NewsStatus.Inactive).length,
        totalCategories: categories.length,
        activeCategories: categories.filter(c => c.isActive).length,
        totalTags: tags.length,
        totalAccounts: accounts.length,
        activeAccounts: accounts.filter(a => a.isActive).length,
        adminCount: accounts.filter(a => a.accountRole === AccountRole.Admin).length,
        staffCount: accounts.filter(a => a.accountRole === AccountRole.Staff).length,
        lecturerCount: accounts.filter(a => a.accountRole === AccountRole.Lecturer).length
      };

      setStats(dashboardStats);

      // Get recent articles (last 5)
      const sortedArticles = articles
        .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
        .slice(0, 5);
      setRecentArticles(sortedArticles);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, href }: {
    title: string;
    value: number;
    icon: string;
    color: string;
    href?: string;
  }) => {
    const content = (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow ${href ? 'cursor-pointer' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <span className="material-icons text-white">{icon}</span>
          </div>
        </div>
      </div>
    );

    return href ? (
      <Link href={href}>
        {content}
      </Link>
    ) : content;
  };

  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-black text-4xl font-bold leading-tight">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome to FU News Management System</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="material-icons text-red-500 mr-2">error</span>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="ml-auto text-red-600 hover:text-red-800 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Articles Stats */}
            <StatCard
              title="Total Articles"
              value={stats.totalArticles}
              icon="article"
              color="bg-blue-500"
              href="/admin/news"
            />
            <StatCard
              title="Active Articles"
              value={stats.activeArticles}
              icon="visibility"
              color="bg-green-500"
              href="/admin/news"
            />
            <StatCard
              title="Categories"
              value={stats.totalCategories}
              icon="category"
              color="bg-purple-500"
              href="/admin/categories"
            />
            <StatCard
              title="Tags"
              value={stats.totalTags}
              icon="local_offer"
              color="bg-orange-500"
              href="/admin/tags"
            />

            {/* Account Stats */}
            <StatCard
              title="Total Accounts"
              value={stats.totalAccounts}
              icon="people"
              color="bg-indigo-500"
              href="/admin/accounts"
            />
            <StatCard
              title="Active Accounts"
              value={stats.activeAccounts}
              icon="person_check"
              color="bg-green-500"
              href="/admin/accounts"
            />
            <StatCard
              title="Admin Users"
              value={stats.adminCount}
              icon="admin_panel_settings"
              color="bg-red-500"
            />
            <StatCard
              title="Staff Users"
              value={stats.staffCount}
              icon="badge"
              color="bg-blue-500"
            />
          </div>

          {/* Recent Articles */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Articles</h2>
                <Link
                  href="/admin/news"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentArticles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="material-icons text-4xl text-gray-300 mb-2">article</span>
                  <p>No articles found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentArticles.map((article) => (
                    <div key={article.newsArticleId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate">{article.newsTitle}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>{article.category?.categoryName || 'No Category'}</span>
                          <span>•</span>
                          <span>{new Date(article.createdDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          article.newsStatus === NewsStatus.Active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {article.newsStatus === NewsStatus.Active ? 'Active' : 'Inactive'}
                        </span>
                        <Link
                          href={`/admin/news/edit/${article.newsArticleId}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <span className="material-icons text-sm">edit</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/admin/news/create"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="material-icons text-blue-600">add_circle</span>
                  <span className="font-medium text-gray-900">New Article</span>
                </Link>
                <Link
                  href="/admin/categories/create"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="material-icons text-purple-600">add_circle</span>
                  <span className="font-medium text-gray-900">New Category</span>
                </Link>
                <Link
                  href="/admin/tags/create"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="material-icons text-orange-600">add_circle</span>
                  <span className="font-medium text-gray-900">New Tag</span>
                </Link>
                <Link
                  href="/admin/accounts/create"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="material-icons text-indigo-600">add_circle</span>
                  <span className="font-medium text-gray-900">New Account</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
} 