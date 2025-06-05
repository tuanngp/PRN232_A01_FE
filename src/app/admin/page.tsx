'use client';

import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalNews: number;
  activeNews: number;
  totalCategories: number;
  totalTags: number;
  totalAccounts: number;
  monthlyViews: number;
}

// Mock data for dashboard
const mockStats: DashboardStats = {
  totalNews: 125,
  activeNews: 118,
  totalCategories: 8,
  totalTags: 25,
  totalAccounts: 12,
  monthlyViews: 15420
};

const mockRecentNews = [
  {
    id: 1,
    title: "FPT University mở rộng chương trình học bổng năm 2025",
    author: "Admin FPT",
    status: "Active",
    createdDate: "2025-01-15T10:00:00Z"
  },
  {
    id: 2,
    title: "Khởi động cuộc thi lập trình FPT CodeWar 2025",
    author: "Staff Tech",
    status: "Active",
    createdDate: "2025-01-14T15:30:00Z"
  },
  {
    id: 3,
    title: "Lễ tốt nghiệp học kỳ Fall 2024",
    author: "Staff Events",
    status: "Draft",
    createdDate: "2025-01-13T09:00:00Z"
  }
];

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  return (
    <AdminRoute>
      <AdminLayout>
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-black text-4xl font-bold leading-tight mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.accountName}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-32" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="material-icons text-blue-600">article</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total News</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalNews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="material-icons text-green-600">check_circle</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active News</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeNews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <span className="material-icons text-purple-600">category</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Categories</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <span className="material-icons text-orange-600">visibility</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Monthly Views</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.monthlyViews.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Link href={ROUTES.ADMIN_NEWS_CREATE || '/admin/news/create'}>
                      <Button className="w-full" variant="primary">
                        <span className="material-icons mr-2">add_circle</span>
                        Create News
                      </Button>
                    </Link>
                    
                    <Link href={ROUTES.ADMIN_CATEGORIES || '/admin/categories'}>
                      <Button className="w-full" variant="outline">
                        <span className="material-icons mr-2">category</span>
                        Manage Categories
                      </Button>
                    </Link>
                    
                    <Link href={ROUTES.ADMIN_TAGS || '/admin/tags'}>
                      <Button className="w-full" variant="outline">
                        <span className="material-icons mr-2">sell</span>
                        Manage Tags
                      </Button>
                    </Link>
                    
                    <Link href={ROUTES.ADMIN_ACCOUNTS || '/admin/accounts'}>
                      <Button className="w-full" variant="outline">
                        <span className="material-icons mr-2">people</span>
                        Manage Users
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent News */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentNews.map((news) => (
                      <div key={news.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                        <span className="material-icons text-gray-400 mt-1">article</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {news.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              By {news.author}
                            </span>
                            <span className={`
                              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                              ${news.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                              }
                            `}>
                              {news.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href="/admin/news">
                      <Button variant="outline" className="w-full">
                        View All Articles
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </AdminLayout>
    </AdminRoute>
  );
} 