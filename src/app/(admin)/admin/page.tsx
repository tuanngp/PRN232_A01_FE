'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { AccountRole } from '@/types/api';

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

  if (!isAuthenticated || user?.accountRole !== AccountRole.Admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không có quyền truy cập
            </h2>
            <p className="text-gray-600 mb-4">
              Bạn không có quyền truy cập vào trang này.
            </p>
            <Link href={ROUTES.HOME}>
              <Button>Về trang chủ</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bảng điều khiển quản trị
              </h1>
              <p className="text-gray-600">Chào mừng, {user?.accountName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={ROUTES.HOME}>
                <Button variant="outline" size="sm">
                  Xem trang chính
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tổng tin tức</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalNews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tin đang hoạt động</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeNews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Danh mục</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Lượt xem/tháng</p>
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
                  <CardTitle>Thao tác nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Link href={ROUTES.ADMIN_NEWS_CREATE}>
                      <Button className="w-full" variant="primary">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tạo tin mới
                      </Button>
                    </Link>
                    
                    <Link href={ROUTES.ADMIN_CATEGORIES}>
                      <Button className="w-full" variant="outline">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Quản lý danh mục
                      </Button>
                    </Link>
                    
                    <Link href={ROUTES.ADMIN_TAGS}>
                      <Button className="w-full" variant="outline">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Quản lý thẻ
                      </Button>
                    </Link>
                    
                    <Link href={ROUTES.ADMIN_ACCOUNTS}>
                      <Button className="w-full" variant="outline">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        Quản lý tài khoản
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent News */}
              <Card>
                <CardHeader>
                  <CardTitle>Tin tức gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentNews.map((news) => (
                      <div key={news.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 line-clamp-1">
                            {news.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Bởi {news.author} • {new Date(news.createdDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          news.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {news.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href={ROUTES.ADMIN_NEWS}>
                      <Button variant="outline" size="sm" className="w-full">
                        Xem tất cả tin tức
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
} 