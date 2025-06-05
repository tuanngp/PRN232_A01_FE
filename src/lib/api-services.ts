// API Services cho FU News Management System
// Updated to match swagger.json specification

import { API_ENDPOINTS, COMMON_QUERIES } from '@/constants/api';
import {
  AccountRole,
  AccountStatistics,
  AddMultipleTagsDto,
  AddTagToArticleDto,
  ApiResponse,
  ApiSingleResponse,
  Category,
  ChangeNewsStatusDto,
  ChangePasswordDto,
  CreateBulkTagsDto,
  CreateCategoryDto,
  CreateNewsArticleDto,
  CreateSystemAccountDto,
  CreateTagDto,
  LoginRequest,
  LoginResponse,
  NewsArticle,
  RefreshTokenRequest,
  ReplaceTagsDto,
  ResetPasswordDto,
  RevokeTokenRequest,
  SearchParams,
  SystemAccount,
  Tag,
  TagStatistics,
  UpdateCategoryDto,
  UpdateNewsArticleDto,
  UpdateProfileDto,
  UpdateSystemAccountDto,
  UpdateTagDto
} from '@/types/api';
import { apiClient } from './api';

// ===== AUTH SERVICES =====

export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiSingleResponse<any>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Store tokens in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Convert role string to number
      let roleNumber: number;
      if (response.data.user.accountRole === 'Admin') {
        roleNumber = 0;
      } else if (response.data.user.accountRole === 'Staff') {
        roleNumber = 1;
      } else if (response.data.user.accountRole === 'Lecturer') {
        roleNumber = 2;
      } else {
        roleNumber = 1; // Default to Staff
      }
      
      localStorage.setItem('accountRole', roleNumber.toString());
      localStorage.setItem('accountName', response.data.user.accountName);
      localStorage.setItem('accountId', response.data.user.accountId.toString());
    }
    
    // Convert the response to match our LoginResponse interface
    const loginResponse: LoginResponse = {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      user: {
        accountId: response.data.user.accountId,
        accountName: response.data.user.accountName,
        accountEmail: response.data.user.accountEmail,
        accountRole: response.data.user.accountRole === 'Admin' ? 0 : 
                    response.data.user.accountRole === 'Staff' ? 1 : 
                    response.data.user.accountRole === 'Lecturer' ? 2 : 1
      },
      accessTokenExpires: response.data.accessTokenExpires,
      refreshTokenExpires: response.data.refreshTokenExpires
    };
    
    return loginResponse;
  },

  // Refresh token (automatic)
  async refreshToken(): Promise<LoginResponse> {
    const response = await apiClient.post<ApiSingleResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN
    );
    
    // Update tokens in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  },

  // Refresh token (manual with tokens)
  async refreshTokenManual(tokens: RefreshTokenRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiSingleResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN_MANUAL,
      tokens
    );
    
    // Update tokens in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  },

  // Revoke token
  async revokeToken(request: RevokeTokenRequest): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.REVOKE_TOKEN, request);
  },

  // Validate token
  async validateToken(): Promise<boolean> {
    try {
      await apiClient.get(API_ENDPOINTS.AUTH.VALIDATE);
      return true;
    } catch {
      return false;
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accountRole');
        localStorage.removeItem('accountName');
        localStorage.removeItem('accountId');
      }
    }
  },

  // Get profile
  async getProfile(): Promise<SystemAccount> {
    const response = await apiClient.get<ApiSingleResponse<SystemAccount>>(
      API_ENDPOINTS.AUTH.PROFILE
    );
    return response.data;
  },

  // Check auth status
  async checkAuth(): Promise<boolean> {
    try {
      await apiClient.get(API_ENDPOINTS.AUTH.CHECK_AUTH);
      return true;
    } catch {
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  // Get current user info from localStorage
  getCurrentUser(): { accountName: string; accountRole: AccountRole; accountId: number } | null {
    if (typeof window === 'undefined') return null;
    
    const accountName = localStorage.getItem('accountName');
    const accountRole = localStorage.getItem('accountRole');
    const accountId = localStorage.getItem('accountId');
    
    if (accountName && accountRole && accountId) {
      return {
        accountName,
        accountRole: parseInt(accountRole) as AccountRole,
        accountId: parseInt(accountId)
      };
    }
    
    return null;
  }
};

// ===== CATEGORY SERVICES =====

export const categoryService = {
  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORY.BASE
    );
    return response.data?.$values || [];
  },

  // Get category by ID
  async getCategoryById(id: number): Promise<Category> {
    const response = await apiClient.get<ApiSingleResponse<Category>>(
      API_ENDPOINTS.CATEGORY.BY_ID(id)
    );
    return response.data;
  },

  // Create category
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const response = await apiClient.post<ApiSingleResponse<Category>>(
      API_ENDPOINTS.CATEGORY.BASE,
      data
    );
    return response.data;
  },

  // Update category
  async updateCategory(id: number, data: UpdateCategoryDto): Promise<Category> {
    const response = await apiClient.put<ApiSingleResponse<Category>>(
      API_ENDPOINTS.CATEGORY.BY_ID(id),
      data
    );
    return response.data;
  },

  // Delete category
  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CATEGORY.BY_ID(id));
  },

  // Get subcategories by parent ID
  async getSubcategories(parentId: number): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORY.SUBCATEGORIES(parentId)
    );
    return response.data?.$values || [];
  },

  // Get root categories
  async getRootCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORY.ROOT
    );
    return response.data?.$values || [];
  },

  // Toggle category status
  async toggleCategoryStatus(id: number): Promise<Category> {
    const response = await apiClient.patch<ApiSingleResponse<Category>>(
      API_ENDPOINTS.CATEGORY.TOGGLE_STATUS(id)
    );
    return response.data;
  },

  // Get category tree
  async getCategoryTree(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORY.TREE
    );
    return response.data?.$values || [];
  },

  // OData: Get categories with OData queries
  async getCategoriesOData(query?: string): Promise<Category[]> {
    const endpoint = query ? `${API_ENDPOINTS.CATEGORY.BASE}?${query}` : API_ENDPOINTS.CATEGORY.BASE;
    const response = await apiClient.get<ApiResponse<Category>>(endpoint);
    return response.data?.$values || [];
  },

  // Get active categories for public use
  async getActiveCategories(): Promise<Category[]> {
    return this.getCategoriesOData(COMMON_QUERIES.ACTIVE_CATEGORIES);
  },

  // Check if category can be deleted (doesn't have news articles)
  async canDeleteCategory(id: number): Promise<boolean> {
    try {
      const newsArticles = await newsService.getNewsOData(`$filter=CategoryId eq ${id}`);
      return newsArticles.length === 0;
    } catch (error) {
      console.error('Error checking if category can be deleted:', error);
      return false;
    }
  },

  // Delete category with constraint check
  async deleteCategoryWithCheck(id: number): Promise<void> {
    const canDelete = await this.canDeleteCategory(id);
    if (!canDelete) {
      throw new Error('Cannot delete category: Category has news articles');
    }
    await this.deleteCategory(id);
  }
};

// ===== NEWS ARTICLE SERVICES =====

export const newsService = {
  // Get all news articles
  async getAllNews(): Promise<NewsArticle[]> {
    const response = await apiClient.get<ApiResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLE.BASE
    );
    return response.data?.$values || [];
  },

  // Get news article by ID
  async getNewsById(id: number): Promise<NewsArticle> {
    const response = await apiClient.get<ApiSingleResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLE.BY_ID(id)
    );
    return response.data;
  },

  // Create news article
  async createNews(data: CreateNewsArticleDto): Promise<NewsArticle> {
    const response = await apiClient.post<ApiSingleResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLE.BASE,
      data
    );
    return response.data;
  },

  // Update news article
  async updateNews(id: number, data: UpdateNewsArticleDto): Promise<NewsArticle> {
    const response = await apiClient.put<ApiSingleResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLE.BY_ID(id),
      data
    );
    return response.data;
  },

  // Delete news article
  async deleteNews(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.NEWS_ARTICLE.BY_ID(id));
  },

  // Change news status
  async changeNewsStatus(id: number, data: ChangeNewsStatusDto): Promise<NewsArticle> {
    const response = await apiClient.patch<ApiSingleResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLE.STATUS(id),
      data
    );
    return response.data;
  },

  // OData: Get news with OData queries
  async getNewsOData(query?: string): Promise<NewsArticle[]> {
    const endpoint = query ? `${API_ENDPOINTS.NEWS_ARTICLE.BASE}?${query}` : API_ENDPOINTS.NEWS_ARTICLE.BASE;
    const response = await apiClient.get<ApiResponse<NewsArticle>>(endpoint);
    return response.data?.$values || [];
  },

  // Get latest news for homepage
  async getLatestNews(limit = 10): Promise<NewsArticle[]> {
    return this.getNewsOData(COMMON_QUERIES.LATEST_NEWS.replace('=10', `=${limit}`));
  },

  // Get active news only
  async getActiveNews(): Promise<NewsArticle[]> {
    return this.getNewsOData(COMMON_QUERIES.ACTIVE_NEWS_ONLY);
  },

  // Get news by category
  async getNewsByCategory(categoryId: number, page = 1, limit = 10): Promise<NewsArticle[]> {
    const skip = (page - 1) * limit;
    const query = `${COMMON_QUERIES.NEWS_BY_CATEGORY(categoryId)}&$orderby=CreatedDate desc&$top=${limit}&$skip=${skip}`;
    return this.getNewsOData(query);
  },

  // Search news
  async searchNews(keyword: string, page = 1, limit = 10): Promise<NewsArticle[]> {
    const skip = (page - 1) * limit;
    const query = `$filter=contains(NewsTitle, '${keyword}') or contains(NewsTitle, '${keyword}')&$orderby=CreatedDate desc&$top=${limit}&$skip=${skip}`;
    return this.getNewsOData(query);
  }
};

// ===== NEWS ARTICLE TAG SERVICES =====

export const newsArticleTagService = {
  // Get tags for an article
  async getArticleTags(articleId: number): Promise<Tag[]> {
    const response = await apiClient.get<ApiResponse<Tag>>(
      API_ENDPOINTS.NEWS_ARTICLE_TAG.ARTICLE_TAGS(articleId)
    );
    return response.data?.$values || [];
  },

  // Add tag to article
  async addTagToArticle(articleId: number, data: AddTagToArticleDto): Promise<void> {
    await apiClient.post(
      API_ENDPOINTS.NEWS_ARTICLE_TAG.ARTICLE_TAGS(articleId),
      data
    );
  },

  // Replace all tags for an article
  async replaceArticleTags(articleId: number, data: ReplaceTagsDto): Promise<void> {
    await apiClient.put(
      API_ENDPOINTS.NEWS_ARTICLE_TAG.ARTICLE_TAGS(articleId),
      data
    );
  },

  // Get articles by tag
  async getArticlesByTag(tagId: number): Promise<NewsArticle[]> {
    const response = await apiClient.get<ApiResponse<NewsArticle>>(
      API_ENDPOINTS.NEWS_ARTICLE_TAG.TAG_ARTICLES(tagId)
    );
    return response.data?.$values || [];
  },

  // Add multiple tags to article
  async addMultipleTagsToArticle(articleId: number, data: AddMultipleTagsDto): Promise<void> {
    await apiClient.post(
      API_ENDPOINTS.NEWS_ARTICLE_TAG.BULK_TAGS(articleId),
      data
    );
  },

  // Remove tag from article
  async removeTagFromArticle(articleId: number, tagId: number): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.NEWS_ARTICLE_TAG.REMOVE_TAG(articleId, tagId)
    );
  },

  // Get popular tags statistics
  async getPopularTags(limit = 10): Promise<TagStatistics[]> {
    const response = await apiClient.get<ApiResponse<TagStatistics>>(
      API_ENDPOINTS.NEWS_ARTICLE_TAG.POPULAR_TAGS,
      { limit }
    );
    return response.data?.$values || [];
  }
};

// ===== SYSTEM ACCOUNT SERVICES =====

export const accountService = {
  // Get all accounts
  async getAllAccounts(): Promise<SystemAccount[]> {
    const response = await apiClient.get<ApiResponse<SystemAccount>>(
      API_ENDPOINTS.SYSTEM_ACCOUNT.BASE
    );
    return response.data?.$values || [];
  },

  // Get account by ID
  async getAccountById(id: number): Promise<SystemAccount> {
    const response = await apiClient.get<ApiSingleResponse<SystemAccount>>(
      API_ENDPOINTS.SYSTEM_ACCOUNT.BY_ID(id)
    );
    return response.data;
  },

  // Create account
  async createAccount(data: CreateSystemAccountDto): Promise<SystemAccount> {
    const response = await apiClient.post<ApiSingleResponse<SystemAccount>>(
      API_ENDPOINTS.SYSTEM_ACCOUNT.BASE,
      data
    );
    return response.data;
  },

  // Update account
  async updateAccount(id: number, data: UpdateSystemAccountDto): Promise<SystemAccount> {
    const response = await apiClient.put<ApiSingleResponse<SystemAccount>>(
      API_ENDPOINTS.SYSTEM_ACCOUNT.BY_ID(id),
      data
    );
    return response.data;
  },

  // Get current user profile
  async getProfile(): Promise<SystemAccount> {
    const response = await apiClient.get<ApiSingleResponse<SystemAccount>>(
      API_ENDPOINTS.SYSTEM_ACCOUNT.PROFILE
    );
    return response.data;
  },

  // Update current user profile
  async updateProfile(data: UpdateProfileDto): Promise<SystemAccount> {
    const response = await apiClient.put<ApiSingleResponse<SystemAccount>>(
      API_ENDPOINTS.SYSTEM_ACCOUNT.PROFILE,
      data
    );
    return response.data;
  },

  // Change password
  async changePassword(data: ChangePasswordDto): Promise<void> {
    await apiClient.patch(
      API_ENDPOINTS.SYSTEM_ACCOUNT.CHANGE_PASSWORD,
      data
    );
  },

  // Reset password
  async resetPassword(id: number, data: ResetPasswordDto): Promise<void> {
    await apiClient.patch(
      API_ENDPOINTS.SYSTEM_ACCOUNT.RESET_PASSWORD(id),
      data
    );
  },

  // Toggle account status
  async toggleAccountStatus(id: number): Promise<SystemAccount> {
    const response = await apiClient.patch<ApiSingleResponse<SystemAccount>>(
      API_ENDPOINTS.SYSTEM_ACCOUNT.TOGGLE_STATUS(id)
    );
    return response.data;
  },

  // Get account statistics
  async getAccountStatistics(): Promise<AccountStatistics> {
    const response = await apiClient.get<ApiSingleResponse<AccountStatistics>>(
      API_ENDPOINTS.SYSTEM_ACCOUNT.STATISTICS
    );
    return response.data;
  },

  // OData: Get accounts with OData queries
  async getAccountsOData(query?: string): Promise<SystemAccount[]> {
    const endpoint = query ? `${API_ENDPOINTS.SYSTEM_ACCOUNT.BASE}?${query}` : API_ENDPOINTS.SYSTEM_ACCOUNT.BASE;
    const response = await apiClient.get<ApiResponse<SystemAccount>>(endpoint);
    return response.data?.$values || [];
  },

  // Get active accounts
  async getActiveAccounts(): Promise<SystemAccount[]> {
    return this.getAccountsOData(COMMON_QUERIES.ACTIVE_ACCOUNTS);
  },

  // Get accounts by role
  async getAccountsByRole(role: AccountRole): Promise<SystemAccount[]> {
    return this.getAccountsOData(COMMON_QUERIES.ACCOUNTS_BY_ROLE(role));
  },

  // Check if account can be deleted (doesn't have news articles)
  async canDeleteAccount(id: number): Promise<boolean> {
    try {
      const newsArticles = await newsService.getNewsOData(`$filter=CreatedBy/AccountId eq ${id}`);
      return newsArticles.length === 0;
    } catch (error) {
      console.error('Error checking if account can be deleted:', error);
      return false;
    }
  },

  // Delete account (if no news articles)
  async deleteAccount(id: number): Promise<void> {
    const canDelete = await this.canDeleteAccount(id);
    if (!canDelete) {
      throw new Error('Cannot delete account: Account has created news articles');
    }
    // Since there's no delete endpoint in swagger, we'll deactivate instead
    await this.toggleAccountStatus(id);
  },

  // Get news articles created by account
  async getNewsCreatedByAccount(accountId: number): Promise<NewsArticle[]> {
    return newsService.getNewsOData(`$filter=CreatedBy/AccountId eq ${accountId}&$orderby=CreatedDate desc`);
  },

  // Get statistics report by date range
  async getStatisticsReport(startDate: string, endDate: string): Promise<{
    totalArticles: number;
    articlesByDate: { date: string; count: number }[];
    articlesByCategory: { categoryName: string; count: number }[];
    articlesByAuthor: { authorName: string; count: number }[];
    articlesByStatus: { status: string; count: number }[];
  }> {
    try {
      // Get articles in date range
      const articles = await newsService.getNewsOData(
        `$filter=CreatedDate ge ${startDate}T00:00:00Z and CreatedDate le ${endDate}T23:59:59Z&$expand=Category,CreatedBy&$orderby=CreatedDate desc`
      );

      // Process statistics
      const articlesByDate = this.groupArticlesByDate(articles);
      const articlesByCategory = this.groupArticlesByCategory(articles);
      const articlesByAuthor = this.groupArticlesByAuthor(articles);
      const articlesByStatus = this.groupArticlesByStatus(articles);

      return {
        totalArticles: articles.length,
        articlesByDate,
        articlesByCategory,
        articlesByAuthor,
        articlesByStatus
      };
    } catch (error) {
      console.error('Error getting statistics report:', error);
      throw error;
    }
  },

  // Helper method to group articles by date
  groupArticlesByDate(articles: NewsArticle[]): { date: string; count: number }[] {
    const grouped = articles.reduce((acc, article) => {
      const date = new Date(article.createdDate).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  // Helper method to group articles by category
  groupArticlesByCategory(articles: NewsArticle[]): { categoryName: string; count: number }[] {
    const grouped = articles.reduce((acc, article) => {
      const categoryName = article.category?.categoryName || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([categoryName, count]) => ({ categoryName, count }))
      .sort((a, b) => b.count - a.count);
  },

  // Helper method to group articles by author
  groupArticlesByAuthor(articles: NewsArticle[]): { authorName: string; count: number }[] {
    const grouped = articles.reduce((acc, article) => {
      const authorName = article.createdBy?.accountName || 'Unknown';
      acc[authorName] = (acc[authorName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([authorName, count]) => ({ authorName, count }))
      .sort((a, b) => b.count - a.count);
  },

  // Helper method to group articles by status
  groupArticlesByStatus(articles: NewsArticle[]): { status: string; count: number }[] {
    const grouped = articles.reduce((acc, article) => {
      const status = article.newsStatus === 1 ? 'Active' : 'Inactive';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }
};

// ===== TAG SERVICES =====

export const tagService = {
  // Get all tags
  async getAllTags(): Promise<Tag[]> {
    const response = await apiClient.get<ApiResponse<Tag>>(
      API_ENDPOINTS.TAG.BASE
    );
    return response.data?.$values || [];
  },

  // Get tag by ID
  async getTagById(id: number): Promise<Tag> {
    const response = await apiClient.get<ApiSingleResponse<Tag>>(
      API_ENDPOINTS.TAG.BY_ID(id)
    );
    return response.data;
  },

  // Create tag
  async createTag(data: CreateTagDto): Promise<Tag> {
    const response = await apiClient.post<ApiSingleResponse<Tag>>(
      API_ENDPOINTS.TAG.BASE,
      data
    );
    return response.data;
  },

  // Update tag
  async updateTag(id: number, data: UpdateTagDto): Promise<Tag> {
    const response = await apiClient.put<ApiSingleResponse<Tag>>(
      API_ENDPOINTS.TAG.BY_ID(id),
      data
    );
    return response.data;
  },

  // Delete tag
  async deleteTag(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TAG.BY_ID(id));
  },

  // Search tags
  async searchTags(keyword: string): Promise<Tag[]> {
    const response = await apiClient.get<ApiResponse<Tag>>(
      API_ENDPOINTS.TAG.SEARCH,
      { keyword }
    );
    return response.data?.$values || [];
  },

  // Get tag statistics
  async getTagStatistics(): Promise<any> {
    const response = await apiClient.get<ApiSingleResponse<any>>(
      API_ENDPOINTS.TAG.STATISTICS
    );
    return response.data;
  },

  // Get popular tags
  async getPopularTags(limit = 10): Promise<Tag[]> {
    const response = await apiClient.get<ApiResponse<Tag>>(
      API_ENDPOINTS.TAG.POPULAR,
      { limit }
    );
    return response.data?.$values || [];
  },

  // Create bulk tags
  async createBulkTags(data: CreateBulkTagsDto): Promise<Tag[]> {
    const response = await apiClient.post<ApiResponse<Tag>>(
      API_ENDPOINTS.TAG.BULK,
      data
    );
    return response.data?.$values || [];
  },

  // OData: Get tags with OData queries
  async getTagsOData(query?: string): Promise<Tag[]> {
    const endpoint = query ? `${API_ENDPOINTS.TAG.BASE}?${query}` : API_ENDPOINTS.TAG.BASE;
    const response = await apiClient.get<ApiResponse<Tag>>(endpoint);
    return response.data?.$values || [];
  }
};

// ===== ODATA SERVICES =====

export const odataService = {
  // Get OData metadata
  async getMetadata(): Promise<any> {
    return await apiClient.get(API_ENDPOINTS.ODATA.METADATA);
  },

  // Get OData service document
  async getServiceDocument(): Promise<any> {
    return await apiClient.get(API_ENDPOINTS.ODATA.SERVICE_DOCUMENT);
  }
};

// ===== SEARCH SERVICES =====

export const searchService = {
  // Universal search across news articles
  async searchAll(params: SearchParams): Promise<{
    articles: NewsArticle[];
    totalCount: number;
  }> {
    const {
      keyword,
      categoryId,
      tagIds,
      status,
      pageNumber = 1,
      pageSize = 10,
      sortBy = 'CreatedDate',
      sortDirection = 'desc'
    } = params;

    const skip = (pageNumber - 1) * pageSize;
    const filters: string[] = [];

    if (keyword) {
      filters.push(`contains(NewsTitle, '${keyword}') or contains(NewsContent, '${keyword}')`);
    }

    if (categoryId) {
      filters.push(`CategoryId eq ${categoryId}`);
    }

    if (status !== undefined) {
      filters.push(`newsStatus eq ${status}`);
    }

    const filterQuery = filters.length > 0 ? `$filter=${filters.join(' and ')}` : '';
    const orderQuery = `$orderby=${sortBy} ${sortDirection}`;
    const topQuery = `$top=${pageSize}`;
    const skipQuery = `$skip=${skip}`;
    const countQuery = '$count=true';

    const queryParams = [filterQuery, orderQuery, topQuery, skipQuery, countQuery]
      .filter(Boolean)
      .join('&');

    const articles = await newsService.getNewsOData(queryParams);
    
    // Get total count (this would need to be implemented based on your API response structure)
    const totalCount = articles.length; // This is a placeholder - adjust based on actual API response

    return {
      articles,
      totalCount
    };
  }
}; 