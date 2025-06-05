'use client';

import { authService } from '@/lib/api-services';
import { storage } from '@/lib/utils';
import { LoginRequest, UserInfo } from '@/types/api';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && authService.isAuthenticated();

  // Check existing authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = storage.get('accessToken');
        
        if (accessToken) {
          // Verify token is still valid
          const isValid = await authService.checkAuth();
          
          if (isValid) {
            // Get current user from localStorage or API
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
              setUser({
                accountId: currentUser.accountId,
                accountName: currentUser.accountName,
                accountEmail: storage.get('accountEmail') || '',
                accountRole: currentUser.accountRole
              });
            } else {
              // If localStorage is incomplete, fetch user profile
              try {
                const profile = await authService.getProfile();
                setUser({
                  accountId: profile.accountId,
                  accountName: profile.accountName,
                  accountEmail: profile.accountEmail,
                  accountRole: profile.accountRole
                });
              } catch {
                // If profile fetch fails, clear invalid session
                await logout();
              }
            }
          } else {
            // Token invalid, clear session
            await logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      // Store additional user data
      storage.set('accountEmail', response.user.accountEmail);
      
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
      
      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshToken();
    } catch (error) {
      // If refresh fails, logout user
      await logout();
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