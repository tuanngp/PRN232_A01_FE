// API Client cho FU News System

import { API_BASE_URL, ERROR_MESSAGES, HTTP_STATUS } from '@/constants/api';

interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
}

interface RequestOptions {
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || API_BASE_URL;
    this.timeout = config.timeout || 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        this.defaultHeaders.Authorization = `Bearer ${token}`;
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      data,
      headers: customHeaders = {},
      params,
      timeout = this.timeout,
    } = options;

    const url = new URL(endpoint, this.baseURL);
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: HeadersInit = {
      ...this.defaultHeaders,
      ...customHeaders,
    };

    const config: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(timeout),
    };

    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        config.body = data;
        // Remove Content-Type to let browser set it with boundary
        delete (headers as Record<string, string>)['Content-Type'];
      } else {
        config.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(url.toString(), config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new ApiError(
          errorData.message || `HTTP Error: ${response.status}`,
          response.status,
          errorData
        );
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        return jsonData;
      } else {
        return (await response.text()) as unknown as T;
      }
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout', 408);
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  private async handleError(response: Response): Promise<never> {
    let errorMessage: string = ERROR_MESSAGES.SERVER_ERROR;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Use default error message if response is not JSON
    }

    switch (response.status) {
      case HTTP_STATUS.BAD_REQUEST:
        errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
        break;
      case HTTP_STATUS.UNAUTHORIZED:
        errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
        // Clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
        }
        break;
      case HTTP_STATUS.FORBIDDEN:
        errorMessage = ERROR_MESSAGES.FORBIDDEN;
        break;
      case HTTP_STATUS.NOT_FOUND:
        errorMessage = ERROR_MESSAGES.NOT_FOUND;
        break;
    }

    throw new ApiError(errorMessage, response.status);
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', data });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', data });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', data });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Helper function to refresh token
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  
  if (!refreshToken) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', newAccessToken);
    }

    return newAccessToken;
  } catch (error) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth/login';
    }
    throw error;
  }
} 