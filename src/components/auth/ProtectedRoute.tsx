'use client';

import { useAuth } from '@/context/AuthContext';
import { AccountRole } from '@/types/api';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AccountRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.push(redirectTo);
        return;
      }

      if (allowedRoles.length > 0 && user) {
        // Check if user role is allowed
        if (!allowedRoles.includes(user.accountRole)) {
          // Role not allowed, redirect to unauthorized page or home
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, redirectTo, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If role check is required and user doesn't have permission
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.accountRole)) {
    return null;
  }

  return <>{children}</>;
}

// Convenience wrapper for admin-only routes
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[AccountRole.Admin]}>
      {children}
    </ProtectedRoute>
  );
}

// Convenience wrapper for staff and admin routes
export function StaffRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[AccountRole.Admin, AccountRole.Staff]}>
      {children}
    </ProtectedRoute>
  );
}

// Convenience wrapper for lecturer routes
export function LecturerRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[AccountRole.Admin, AccountRole.Staff, AccountRole.Lecturer]}>
      {children}
    </ProtectedRoute>
  );
} 