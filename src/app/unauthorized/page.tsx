'use client';

import { useAuth } from '@/context/AuthContext';
import { AccountRole } from '@/types/api';
import Link from 'next/link';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();

  console.log("user", user);
  const getRoleDisplayName = (role: AccountRole): string => {
    switch (role) {
      case AccountRole.Admin:
        return 'Administrator';
      case AccountRole.Staff:
        return 'Staff Member';
      case AccountRole.Lecturer:
        return 'Lecturer';
      default:
        return 'User';
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <span className="material-icons text-red-600 text-3xl">block</span>
          </div>
        </div>

        {/* Title and Message */}
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
        <p className="text-slate-600 mb-6">
          You don't have permission to access this page. This area is restricted to specific user roles.
        </p>

        {/* User Info */}
        {user && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-slate-900 mb-2">Current Account</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Name:</span> {user.accountName}</p>
              <p><span className="font-medium">Email:</span> {user.accountEmail}</p>
              <p><span className="font-medium">Role:</span> {getRoleDisplayName(user.accountRole)}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors inline-block"
          >
            Go to Home
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Sign Out and Login with Different Account
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-slate-200 text-sm text-slate-500">
          <p>If you believe this is an error, please contact your system administrator for assistance.</p>
        </div>
      </div>
    </div>
  );
} 