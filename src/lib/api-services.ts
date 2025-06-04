// API Services cho FU News System
// Provides specific functions for each API endpoint used in components

import { apiClient } from './api';
import { API_ENDPOINTS, COMMON_QUERIES } from '@/constants/api';
import { 
  NewsArticle, 
  Category, 
  Tag, 
  SystemAccount, 
  LoginRequest, 
  LoginResponse,
  NewsArticleRequest,
  CategoryRequest,
  TagRequest,
  SystemAccountRequest,
  ApiResponse,
  ApiSingleResponse
} from '@/types/api';

// ===== NEWS SERVICES =====

export const newsService = {
  // Get latest news for homepage
  async getLatestNews(limit = 10): Promise<NewsArticle[]> {
    const response = await apiClient.get<ApiResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLES,
      { $orderby: 'CreatedDate desc', $top: limit, $filter: "NewsStatus eq 'Active'" }
    );
    return response.data?.$values || [];
  },

  // Get news by category
  async getNewsByCategory(categoryId: number, page = 1, limit = 10): Promise<NewsArticle[]> {
    const skip = (page - 1) * limit;
    const response = await apiClient.get<ApiResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLES,
      { 
        $filter: `CategoryId eq ${categoryId} and NewsStatus eq 'Active'`,
        $orderby: 'CreatedDate desc',
        $top: limit,
        $skip: skip
      }
    );
    return response.data?.$values || [];
  },

  // Get news detail by ID
  async getNewsById(id: number): Promise<NewsArticle> {
    const response = await apiClient.get<ApiSingleResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLE_BY_ID(id)
    );
    return response.data;
  },

  // Search news by keyword
  async searchNews(keyword: string, page = 1, limit = 10): Promise<NewsArticle[]> {
    const skip = (page - 1) * limit;
    const response = await apiClient.get<ApiResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLES,
      { 
        $filter: `contains(NewsTitle, '${keyword}') or contains(NewsContent, '${keyword}')`,
        $orderby: 'CreatedDate desc',
        $top: limit,
        $skip: skip
      }
    );
    return response.data?.$values || [];
  },

  // Get featured news (example: top 5 most recent)
  async getFeaturedNews(): Promise<NewsArticle[]> {
    const response = await apiClient.get<ApiResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLES,
      { $orderby: 'CreatedDate desc', $top: 5, $filter: "NewsStatus eq 'Active'" }
    );
    return response.data?.$values || [];
  },

  // Admin/Staff: Create news article
  async createNews(data: NewsArticleRequest): Promise<NewsArticle> {
    const response = await apiClient.post<ApiSingleResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLES,
      data
    );
    return response.data;
  },

  // Admin/Staff: Update news article
  async updateNews(id: number, data: NewsArticleRequest): Promise<NewsArticle> {
    const response = await apiClient.put<ApiSingleResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLE_BY_ID(id),
      data
    );
    return response.data;
  },

  // Admin/Staff: Delete news article
  async deleteNews(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.NEWS_ARTICLE_BY_ID(id));
  },

  // Admin/Staff: Get all news with pagination
  async getAllNews(page = 1, limit = 10): Promise<NewsArticle[]> {
    const skip = (page - 1) * limit;
    const response = await apiClient.get<ApiResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLES,
      { 
        $orderby: 'CreatedDate desc',
        $top: limit,
        $skip: skip
      }
    );
    return response.data?.$values || [];
  }
};

// ===== CATEGORY SERVICES =====

export const categoryService = {
  // Get all active categories for public navigation
  async getActiveCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORIES,
      { $filter: 'IsActive eq true' }
    );
    return response.data?.$values || [];
  },

  // Get all categories (for admin)
  async getAllCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORIES
    );
    return response.data?.$values || [];
  },

  // Get category by ID
  async getCategoryById(id: number): Promise<Category> {
    const response = await apiClient.get<ApiSingleResponse<Category>>(
      API_ENDPOINTS.CATEGORY_BY_ID(id)
    );
    return response.data;
  },

  // Admin/Staff: Create category
  async createCategory(data: CategoryRequest): Promise<Category> {
    const response = await apiClient.post<ApiSingleResponse<Category>>(
      API_ENDPOINTS.CATEGORIES,
      data
    );
    return response.data;
  },

  // Admin/Staff: Update category
  async updateCategory(id: number, data: CategoryRequest): Promise<Category> {
    const response = await apiClient.put<ApiSingleResponse<Category>>(
      API_ENDPOINTS.CATEGORY_BY_ID(id),
      data
    );
    return response.data;
  },

  // Admin/Staff: Delete category
  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CATEGORY_BY_ID(id));
  }
};

// ===== TAG SERVICES =====

export const tagService = {
  // Get all tags
  async getAllTags(): Promise<Tag[]> {
    const response = await apiClient.get<ApiResponse<Tag>>(
      API_ENDPOINTS.TAGS
    );
    return response.data?.$values || [];
  },

  // Get tag by ID
  async getTagById(id: number): Promise<Tag> {
    const response = await apiClient.get<ApiSingleResponse<Tag>>(
      API_ENDPOINTS.TAG_BY_ID(id)
    );
    return response.data;
  },

  // Admin/Staff: Create tag
  async createTag(data: TagRequest): Promise<Tag> {
    const response = await apiClient.post<ApiSingleResponse<Tag>>(
      API_ENDPOINTS.TAGS,
      data
    );
    return response.data;
  },

  // Admin/Staff: Update tag
  async updateTag(id: number, data: TagRequest): Promise<Tag> {
    const response = await apiClient.put<ApiSingleResponse<Tag>>(
      API_ENDPOINTS.TAG_BY_ID(id),
      data
    );
    return response.data;
  },

  // Admin/Staff: Delete tag
  async deleteTag(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TAG_BY_ID(id));
  }
};

// ===== AUTH SERVICES =====

export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiSingleResponse<LoginResponse>>(
      API_ENDPOINTS.LOGIN,
      credentials
    );
    
    // Store tokens in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('accountRole', response.data.accountRole.toString());
      localStorage.setItem('accountName', response.data.accountName);
    }
    
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.REVOKE_TOKEN);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accountRole');
        localStorage.removeItem('accountName');
      }
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  // Get current user info from localStorage
  getCurrentUser(): { accountName: string; accountRole: number } | null {
    if (typeof window === 'undefined') return null;
    
    const accountName = localStorage.getItem('accountName');
    const accountRole = localStorage.getItem('accountRole');
    
    if (accountName && accountRole) {
      return {
        accountName,
        accountRole: parseInt(accountRole)
      };
    }
    
    return null;
  }
};

// ===== ACCOUNT SERVICES =====

export const accountService = {
  // Admin: Get all accounts
  async getAllAccounts(): Promise<SystemAccount[]> {
    const response = await apiClient.get<ApiResponse<SystemAccount>>(
      API_ENDPOINTS.SYSTEM_ACCOUNTS
    );
    return response.data?.$values || [];
  },

  // Admin: Get account by ID
  async getAccountById(id: number): Promise<SystemAccount> {
    const response = await apiClient.get<ApiSingleResponse<SystemAccount>>(
      API_ENDPOINTS.SYSTEM_ACCOUNT_BY_ID(id)
    );
    return response.data;
  },

  // Admin: Create account
  async createAccount(data: SystemAccountRequest): Promise<SystemAccount> {
    const response = await apiClient.post<ApiSingleResponse<SystemAccount>>(
      API_ENDPOINTS.SYSTEM_ACCOUNTS,
      data
    );
    return response.data;
  },

  // Admin: Update account
  async updateAccount(id: number, data: SystemAccountRequest): Promise<SystemAccount> {
    const response = await apiClient.put<ApiSingleResponse<SystemAccount>>(
      API_ENDPOINTS.SYSTEM_ACCOUNT_BY_ID(id),
      data
    );
    return response.data;
  },

  // Admin: Delete account
  async deleteAccount(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SYSTEM_ACCOUNT_BY_ID(id));
  }
};

// ===== UTILITY SERVICES =====

export const utilityService = {
  // Get news count for pagination
  async getNewsCount(categoryId?: number, searchKeyword?: string): Promise<number> {
    let filter = "NewsStatus eq 'Active'";
    
    if (categoryId) {
      filter += ` and CategoryId eq ${categoryId}`;
    }
    
    if (searchKeyword) {
      filter += ` and (contains(NewsTitle, '${searchKeyword}') or contains(NewsContent, '${searchKeyword}'))`;
    }

    const response = await apiClient.get<ApiResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLES,
      { 
        $filter: filter,
        $count: true
      }
    );
    
    return response.data?.$values?.length || 0;
  }
}; 