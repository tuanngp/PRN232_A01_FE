"use client";

import { StaffRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import {
  accountService,
  categoryService,
  newsService,
  tagService,
} from "@/lib/api-services";
import { AccountRole, Category, NewsArticle, NewsStatus, SystemAccount, Tag } from "@/types/api";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  const { user } = useAuth();
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
    lecturerCount: 0,
  });
  const [recentArticles, setRecentArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const isAdmin = user?.accountRole === AccountRole.Admin;
  const isStaff = user?.accountRole === AccountRole.Staff;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let articles: NewsArticle[] = [];
      let categories: Category[] = [];
      let tags: Tag[] = [];
      let accounts: SystemAccount[] = [];

      if (isAdmin) {
        // Admin fetches account data
        accounts = await accountService.getAllAccounts();
      } else {
        // Staff fetches content data
        const [articlesData, categoriesData, tagsData] = await Promise.all([
          newsService.getAllNews(),
          categoryService.getAllCategories(),
          tagService.getAllTags(),
        ]);
        articles = articlesData;
        categories = categoriesData;
        tags = tagsData;
      }

      // Calculate statistics
      const dashboardStats: DashboardStats = {
        totalArticles: articles.length,
        activeArticles: articles.filter(
          (a) => a.newsStatus === NewsStatus.Active
        ).length,
        inactiveArticles: articles.filter(
          (a) => a.newsStatus === NewsStatus.Inactive
        ).length,
        totalCategories: categories.length,
        activeCategories: categories.filter((c) => c.isActive).length,
        totalTags: tags.length,
        totalAccounts: accounts.length,
        activeAccounts: accounts.filter((a) => a.isActive).length,
        adminCount: accounts.filter((a) => a.accountRole === AccountRole.Admin)
          .length,
        staffCount: accounts.filter((a) => a.accountRole === AccountRole.Staff)
          .length,
        lecturerCount: accounts.filter(
          (a) => a.accountRole === AccountRole.Lecturer
        ).length,
      };

      setStats(dashboardStats);

      if (articles.length > 0) {
        const sortedArticles = articles
          .sort(
            (a, b) =>
              new Date(b.createdDate).getTime() -
              new Date(a.createdDate).getTime()
          )
          .slice(0, 5);
        setRecentArticles(sortedArticles);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StaffRoute>
        <AdminLayout>
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </AdminLayout>
      </StaffRoute>
    );
  }

  return (
    <StaffRoute>
      <AdminLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-black text-4xl font-bold leading-tight">
                {isAdmin ? "Admin Dashboard" : "Staff Dashboard"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isAdmin
                  ? "Manage system accounts and overview"
                  : "Manage news content, categories, and tags"}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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

          {/* Stats Grid - Role-based visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Staff can see content management stats */}
            {isStaff && (
              <>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Total Articles
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalArticles}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {stats.activeArticles} active
                      </p>
                    </div>
                    <span className="material-icons text-blue-600 text-4xl">
                      article
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Categories</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalCategories}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {stats.activeCategories} active
                      </p>
                    </div>
                    <span className="material-icons text-green-600 text-4xl">
                      category
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tags</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalTags}
                      </p>
                    </div>
                    <span className="material-icons text-orange-600 text-4xl">
                      sell
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Admin can see account management stats */}
            {isAdmin && (
              <>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Total Accounts
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalAccounts}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {stats.activeAccounts} active
                      </p>
                    </div>
                    <span className="material-icons text-purple-600 text-4xl">
                      people
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Administrators
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.adminCount}
                      </p>
                    </div>
                    <span className="material-icons text-red-600 text-4xl">
                      admin_panel_settings
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Staff Members
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.staffCount}
                      </p>
                    </div>
                    <span className="material-icons text-blue-600 text-4xl">
                      work
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Lecturers</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.lecturerCount}
                      </p>
                    </div>
                    <span className="material-icons text-green-600 text-4xl">
                      school
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions - Role-based */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isStaff && (
                <>
                  <Link
                    href="/admin/news/create"
                    className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <span className="material-icons text-blue-600">
                      add_circle
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        Create Article
                      </p>
                      <p className="text-sm text-gray-600">
                        Write a new news article
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/admin/categories"
                    className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <span className="material-icons text-green-600">
                      category
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        Manage Categories
                      </p>
                      <p className="text-sm text-gray-600">
                        Organize content categories
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/admin/tags"
                    className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                  >
                    <span className="material-icons text-orange-600">sell</span>
                    <div>
                      <p className="font-medium text-gray-900">Manage Tags</p>
                      <p className="text-sm text-gray-600">
                        Create and edit tags
                      </p>
                    </div>
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    href="/admin/accounts"
                    className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <span className="material-icons text-purple-600">
                      people
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        Manage Accounts
                      </p>
                      <p className="text-sm text-gray-600">
                        User account administration
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="material-icons text-gray-600">
                      settings
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        System Settings
                      </p>
                      <p className="text-sm text-gray-600">
                        Configure system preferences
                      </p>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Recent Articles - Both can see */}
          {recentArticles.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Articles
                  </h3>
                  <Link
                    href="/admin/news"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentArticles.slice(0, 5).map((article) => (
                    <div
                      key={article.newsArticleId}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {article.newsTitle}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(article.createdDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            article.newsStatus === NewsStatus.Active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {article.newsStatus === NewsStatus.Active
                            ? "Active"
                            : "Inactive"}
                        </span>
                        {isStaff && (
                          <Link
                            href={`/admin/news/edit/${article.newsArticleId}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <span className="material-icons text-sm">edit</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </StaffRoute>
  );
}
