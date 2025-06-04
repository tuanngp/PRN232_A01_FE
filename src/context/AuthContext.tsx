'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LoginResponse, AccountRole } from '@/types/api';
import { storage } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants/api';

interface User {
  accountName: string;
  accountRole: AccountRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check existing authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = storage.get('accessToken');
      const accountName = storage.get('accountName');
      const accountRole = storage.get('accountRole');

      if (accessToken && accountName && accountRole) {
        setUser({
          accountName,
          accountRole: parseInt(accountRole) as AccountRole,
        });
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });

      // Store tokens and user info
      storage.set('accessToken', response.accessToken);
      storage.set('refreshToken', response.refreshToken);
      storage.set('accountName', response.accountName);
      storage.set('accountRole', response.accountRole.toString());

      setUser({
        accountName: response.accountName,
        accountRole: response.accountRole,
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear tokens and user info
    storage.remove('accessToken');
    storage.remove('refreshToken');
    storage.remove('accountName');
    storage.remove('accountRole');

    setUser(null);

    // Optionally call revoke token API
    const refreshToken = storage.get('refreshToken');
    if (refreshToken) {
      apiClient.post(API_ENDPOINTS.REVOKE_TOKEN, { refreshToken }).catch(() => {
        // Ignore errors on logout
      });
    }

    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const refreshTokenValue = storage.get('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.REFRESH_TOKEN, {
        refreshToken: refreshTokenValue,
      });

      // Update tokens
      storage.set('accessToken', response.accessToken);
      storage.set('refreshToken', response.refreshToken);
    } catch (error) {
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 