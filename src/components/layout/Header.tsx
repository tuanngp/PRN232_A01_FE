'use client';

import { useAuth } from '@/context/AuthContext';
import { useActiveCategories } from '@/hooks/useCategories';
import { AccountRole } from '@/types/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { categories } = useActiveCategories();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.push('/');
  };

  const getUserRoleText = (role?: AccountRole) => {
    switch (role) {
      case AccountRole.Admin:
        return 'Administrator';
      case AccountRole.Staff:
        return 'Staff';
      case AccountRole.Lecturer:
        return 'Lecturer';
      default:
        return 'User';
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-slate-200/60 bg-white/80 backdrop-blur-lg px-10 py-4 shadow-lg shadow-slate-200/20">
      {/* Logo */}
      <div className="flex items-center gap-3 text-slate-900">
        <div className="text-2xl text-blue-600 transform hover:scale-110 transition-transform duration-200">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
          </svg>
        </div>
        <Link href="/" className="text-slate-900 text-2xl font-bold leading-tight tracking-tight hover:text-blue-600 transition-all duration-300 hover:scale-105">
          FU News
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-1 justify-center">
        <ul className="flex items-center gap-8">
          <li>
            <Link className="text-slate-700 hover:text-blue-600 text-base font-medium leading-normal transition-colors" href="/">
              Home
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.categoryId}>
              <Link 
                className="text-slate-700 hover:text-blue-600 text-base font-medium leading-normal transition-colors" 
                href={`/category/${category.categoryId}`}
              >
                {category.categoryName}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Actions */}
      <div className="flex items-center gap-3">
        <Link 
          href="/search" 
          aria-label="Search" 
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-blue-50 hover:to-blue-100 text-slate-700 hover:text-blue-600 transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md"
        >
          <span className="material-icons text-xl">search</span>
        </Link>
        
        {isAuthenticated && user ? (
          <div className="relative">
            {/* User Menu Button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-white to-slate-50 hover:from-blue-50 hover:to-blue-100 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md border border-slate-200/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {user.accountName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-slate-900">{user.accountName}</div>
                  <div className="text-xs text-slate-500">{getUserRoleText(user.accountRole)}</div>
                </div>
              </div>
              <span className="material-icons text-slate-400 text-lg">
                {showUserMenu ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-medium text-slate-900">{user.accountName}</div>
                  <div className="text-xs text-slate-500">{user.accountEmail}</div>
                  <div className="text-xs text-blue-600 mt-1">{getUserRoleText(user.accountRole)}</div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {(user.accountRole === AccountRole.Admin || user.accountRole === AccountRole.Staff) && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="material-icons text-blue-600 text-lg">
                        {user.accountRole === AccountRole.Admin ? 'admin_panel_settings' : 'work'}
                      </span>
                      {user.accountRole === AccountRole.Admin ? 'Admin Dashboard' : 'Staff Dashboard'}
                    </Link>
                  )}
                  
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span className="material-icons text-slate-600 text-lg">person</span>
                    Profile
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span className="material-icons text-slate-600 text-lg">settings</span>
                    Settings
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="material-icons text-red-600 text-lg">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Guest Actions */
          <>
            <Link 
              href="/auth/login" 
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/auth/register" 
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>

      {/* Overlay to close menu when clicking outside */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
} 