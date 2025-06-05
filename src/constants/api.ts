// API Constants cho FU News Management System - Updated from Swagger

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// API Endpoints - Updated to match swagger.json exactly
export const API_ENDPOINTS = {
  // Auth Endpoints
  AUTH: {
    LOGIN: '/api/Auth/login',
    GOOGLE_LOGIN: '/api/auth/google-login',
    REFRESH_TOKEN: '/api/Auth/refresh-token',
    REFRESH_TOKEN_MANUAL: '/api/Auth/refresh-token-manual',
    REVOKE_TOKEN: '/api/Auth/revoke-token',
    VALIDATE: '/api/Auth/validate',
    LOGOUT: '/api/Auth/logout',
    PROFILE: '/api/Auth/profile',
    CHECK_AUTH: '/api/Auth/check-auth',
  },

  // Category Endpoints
  CATEGORY: {
    BASE: '/api/Category',
    BY_ID: (id: number) => `/api/Category/${id}`,
    SUBCATEGORIES: (parentId: number) => `/api/Category/${parentId}/subcategories`,
    ROOT: '/api/Category/root',
    TOGGLE_STATUS: (id: number) => `/api/Category/${id}/toggle-status`,
    TREE: '/api/Category/tree',
  },

  // News Article Endpoints
  NEWS_ARTICLE: {
    BASE: '/api/NewsArticle',
    BY_ID: (id: number) => `/api/NewsArticle/${id}`,
    STATUS: (id: number) => `/api/NewsArticle/${id}/status`,
  },

  // News Article Tag Endpoints
  NEWS_ARTICLE_TAG: {
    ARTICLE_TAGS: (articleId: number) => `/api/NewsArticleTag/article/${articleId}/tags`,
    TAG_ARTICLES: (tagId: number) => `/api/NewsArticleTag/tag/${tagId}/articles`,
    BULK_TAGS: (articleId: number) => `/api/NewsArticleTag/article/${articleId}/tags/bulk`,
    REMOVE_TAG: (articleId: number, tagId: number) => `/api/NewsArticleTag/article/${articleId}/tags/${tagId}`,
    POPULAR_TAGS: '/api/NewsArticleTag/statistics/popular-tags',
  },

  // System Account Endpoints
  SYSTEM_ACCOUNT: {
    BASE: '/api/SystemAccount',
    BY_ID: (id: number) => `/api/SystemAccount/${id}`,
    PROFILE: '/api/SystemAccount/profile',
    CHANGE_PASSWORD: '/api/SystemAccount/change-password',
    RESET_PASSWORD: (id: number) => `/api/SystemAccount/${id}/reset-password`,
    TOGGLE_STATUS: (id: number) => `/api/SystemAccount/${id}/toggle-status`,
    STATISTICS: '/api/SystemAccount/statistics',
  },

  // Tag Endpoints
  TAG: {
    BASE: '/api/Tag',
    BY_ID: (id: number) => `/api/Tag/${id}`,
    SEARCH: '/api/Tag/search',
    STATISTICS: '/api/Tag/statistics',
    POPULAR: '/api/Tag/popular',
    BULK: '/api/Tag/bulk',
  },

  // OData Metadata Endpoints
  ODATA: {
    METADATA: '/odata/$metadata',
    SERVICE_DOCUMENT: '/odata',
  },
} as const;

// OData Query Parameters
export const ODATA_PARAMS = {
  ORDER_BY: '$orderby',
  FILTER: '$filter',
  TOP: '$top',
  SKIP: '$skip',
  SELECT: '$select',
  EXPAND: '$expand',
  COUNT: '$count',
  SEARCH: '$search',
} as const;

// Common OData Queries
export const COMMON_QUERIES = {
  // News Article Queries
  LATEST_NEWS: `${ODATA_PARAMS.ORDER_BY}=CreatedDate desc&${ODATA_PARAMS.TOP}=10`,
  NEWS_BY_CATEGORY: (categoryId: number) => `${ODATA_PARAMS.FILTER}=CategoryId eq ${categoryId}`,
  NEWS_BY_STATUS: (status: number) => `${ODATA_PARAMS.FILTER}=NewsStatus eq ${status}`,
  ACTIVE_NEWS_ONLY: `${ODATA_PARAMS.FILTER}=NewsStatus eq 1`,
  SEARCH_NEWS_TITLE: (keyword: string) => `${ODATA_PARAMS.FILTER}=contains(NewsTitle, '${keyword}')`,
  SEARCH_NEWS_CONTENT: (keyword: string) => `${ODATA_PARAMS.FILTER}=contains(NewsContent, '${keyword}')`,
  
  // Category Queries
  ACTIVE_CATEGORIES: `${ODATA_PARAMS.FILTER}=IsActive eq true`,
  ROOT_CATEGORIES: `${ODATA_PARAMS.FILTER}=ParentCategoryId eq null`,
  CATEGORIES_BY_PARENT: (parentId: number) => `${ODATA_PARAMS.FILTER}=ParentCategoryId eq ${parentId}`,
  
  // Tag Queries
  SEARCH_TAGS: (keyword: string) => `${ODATA_PARAMS.FILTER}=contains(TagName, '${keyword}')`,
  POPULAR_TAGS: (limit: number = 10) => `${ODATA_PARAMS.ORDER_BY}=ArticleCount desc&${ODATA_PARAMS.TOP}=${limit}`,
  
  // Account Queries
  ACTIVE_ACCOUNTS: `${ODATA_PARAMS.FILTER}=IsActive eq true`,
  ACCOUNTS_BY_ROLE: (role: number) => `${ODATA_PARAMS.FILTER}=AccountRole eq ${role}`,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  UNAUTHORIZED: 'Vui lòng đăng nhập',
  FORBIDDEN: 'Bạn không có quyền thực hiện hành động này',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  SERVER_ERROR: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  LOGIN_FAILED: 'Thông tin đăng nhập không chính xác',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa',
  INVALID_TOKEN: 'Token không hợp lệ',
  TOKEN_EXPIRED: 'Token đã hết hạn',
  EMAIL_EXISTS: 'Email đã tồn tại trong hệ thống',
  CATEGORY_HAS_CHILDREN: 'Không thể xóa danh mục có danh mục con',
  CATEGORY_HAS_ARTICLES: 'Không thể xóa danh mục có bài viết',
  TAG_HAS_ARTICLES: 'Không thể xóa tag có bài viết',
  WEAK_PASSWORD: 'Mật khẩu quá yếu',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
} as const;

// Validation Rules (Updated from swagger constraints)
export const VALIDATION_RULES = {
  // News Article Validation
  NEWS_TITLE_MAX_LENGTH: 200,
  NEWS_TITLE_MIN_LENGTH: 1,
  HEADLINE_MAX_LENGTH: 500,
  NEWS_CONTENT_MIN_LENGTH: 10,
  NEWS_SOURCE_MAX_LENGTH: 200,
  
  // Category Validation
  CATEGORY_NAME_MAX_LENGTH: 100,
  CATEGORY_NAME_MIN_LENGTH: 1,
  CATEGORY_DESCRIPTION_MAX_LENGTH: 500,
  
  // Tag Validation
  TAG_NAME_MAX_LENGTH: 50,
  TAG_NAME_MIN_LENGTH: 1,
  TAG_NOTE_MAX_LENGTH: 200,
  
  // Account Validation
  ACCOUNT_NAME_MAX_LENGTH: 50,
  ACCOUNT_NAME_MIN_LENGTH: 1,
  ACCOUNT_EMAIL_MAX_LENGTH: 100,
  ACCOUNT_EMAIL_MIN_LENGTH: 1,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
  
  // Search
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_LENGTH: 100,
} as const;

// Account Roles (Match with swagger enum)
export const ACCOUNT_ROLES = {
  ADMIN: 0,
  STAFF: 1,
  LECTURER: 2,
} as const;

// News Status (Match with swagger enum)
export const NEWS_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
} as const;

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const;

// Cache Keys
export const CACHE_KEYS = {
  NEWS_ARTICLES: 'news_articles',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  SYSTEM_ACCOUNTS: 'system_accounts',
  USER_PROFILE: 'user_profile',
  CATEGORY_TREE: 'category_tree',
  POPULAR_TAGS: 'popular_tags',
} as const; 