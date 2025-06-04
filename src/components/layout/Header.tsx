'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { AccountRole } from '@/types/api';

interface HeaderProps {
  categories?: Array<{
    categoryId: number;
    categoryName: string;
  }>;
}

export function Header({ categories = [] }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* Top Bar */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10 text-sm">
            <div className="flex items-center space-x-4">
              <span>Tin tức FPT University</span>
              <span>•</span>
              <span>Cập nhật 24/7</span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 hover:text-blue-200 transition-colors"
                  >
                    <span>Xin chào, {user?.accountName}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white text-gray-900 rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        {user?.accountRole === AccountRole.Admin && (
                          <Link
                            href={ROUTES.ADMIN_DASHBOARD}
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Quản trị hệ thống
                          </Link>
                        )}
                        {user?.accountRole === AccountRole.Staff && (
                          <Link
                            href={ROUTES.STAFF_DASHBOARD}
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Bảng điều khiển
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={ROUTES.LOGIN}
                  className="hover:text-blue-200 transition-colors"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FU</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FU News</h1>
              <p className="text-xs text-gray-500">Tin tức FPT University</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href={ROUTES.HOME}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Trang chủ
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center space-x-1">
                <span>Danh mục</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {categories.map((category) => (
                    <Link
                      key={category.categoryId}
                      href={ROUTES.CATEGORY(category.categoryId)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      {category.categoryName}
                    </Link>
                  ))}
                  {categories.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Không có danh mục nào
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Link
              href={ROUTES.SEARCH}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Tìm kiếm
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            <Link
              href={ROUTES.HOME}
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            
            {categories.map((category) => (
              <Link
                key={category.categoryId}
                href={ROUTES.CATEGORY(category.categoryId)}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {category.categoryName}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
} 