// Authentication hooks for FU News System
// Provides authentication state management and operations

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { LoginRequest, LoginResponse } from '@/types/api';
import { authService } from '@/lib/api-services';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { accountName: string; accountRole: number } | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

interface UseAuthResult {
  isAuthenticated: boolean;
  user: { accountName: string; accountRole: number } | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Simple hook without context (can be used directly)
export function useAuth(): UseAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ accountName: string; accountRole: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        setLoading(true);
        const authenticated = authService.isAuthenticated();
        const currentUser = authService.getCurrentUser();
        
        setIsAuthenticated(authenticated);
        setUser(currentUser);
      } catch (err) {
        console.error('Error checking auth status:', err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      setIsAuthenticated(true);
      setUser({
        accountName: response.accountName,
        accountRole: response.accountRole
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.logout();
      
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local state even if API call fails
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    clearError
  };
}

// Hook for checking if user has specific role
export function useRoleCheck(requiredRole: number) {
  const { user, isAuthenticated } = useAuth();
  
  const hasRole = isAuthenticated && user && user.accountRole === requiredRole;
  const isAdmin = isAuthenticated && user && user.accountRole === 0;
  const isStaff = isAuthenticated && user && user.accountRole === 1;
  
  return {
    hasRole,
    isAdmin,
    isStaff,
    currentRole: user?.accountRole
  };
}

// Hook for protecting routes
export function useRouteProtection(requiredRole?: number) {
  const { isAuthenticated, user, loading } = useAuth();
  
  const isAuthorized = isAuthenticated && (!requiredRole || (user && user.accountRole === requiredRole));
  const shouldRedirect = !loading && !isAuthorized;
  
  return {
    isAuthenticated,
    isAuthorized,
    shouldRedirect,
    loading,
    user
  };
}

// Hook for login form
export function useLoginForm() {
  const [credentials, setCredentials] = useState<LoginRequest>({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  
  const { login, error, clearError } = useAuth();

  const validateForm = useCallback(() => {
    const errors: { email?: string; password?: string } = {};
    
    if (!credentials.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!credentials.password.trim()) {
      errors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [credentials]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();
      await login(credentials);
      // Success - redirect will be handled by calling component
    } catch (err) {
      // Error is already set by login function
    } finally {
      setIsSubmitting(false);
    }
  }, [credentials, validateForm, login, clearError]);

  const updateCredentials = useCallback((field: keyof LoginRequest, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [validationErrors]);

  return {
    credentials,
    validationErrors,
    isSubmitting,
    error,
    updateCredentials,
    handleSubmit,
    clearError
  };
} 