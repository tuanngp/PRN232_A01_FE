// API Constants cho FU News System

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // News Articles
  NEWS_ARTICLES: '/api/NewsArticle',
  NEWS_ARTICLE_BY_ID: (id: number) => `/api/NewsArticle/${id}`,
  NEWS_ARTICLE_STATUS: (id: number) => `/api/NewsArticle/${id}/status`,
  
  // Categories
  CATEGORIES: '/api/category',
  CATEGORY_BY_ID: (id: number) => `/api/category/${id}`,
  
  // Tags
  TAGS: '/api/tags',
  TAG_BY_ID: (id: number) => `/api/tags/${id}`,
  
  // Auth
  LOGIN: '/api/auth/login',
  REFRESH_TOKEN: '/api/auth/refresh-token',
  REVOKE_TOKEN: '/api/auth/revoke-token',
  
  // System Accounts
  SYSTEM_ACCOUNTS: '/api/SystemAccounts',
  SYSTEM_ACCOUNT_BY_ID: (id: number) => `/api/SystemAccounts/${id}`,
} as const;

// OData Query Parameters
export const ODATA_PARAMS = {
  ORDER_BY: '$orderby',
  FILTER: '$filter',
  TOP: '$top',
  SKIP: '$skip',
  SELECT: '$select',
  EXPAND: '$expand',
} as const;

// Common OData Queries
export const COMMON_QUERIES = {
  LATEST_NEWS: `${ODATA_PARAMS.ORDER_BY}=CreatedDate desc&${ODATA_PARAMS.TOP}=10`,
  NEWS_BY_CATEGORY: (categoryId: number) => `${ODATA_PARAMS.FILTER}=CategoryId eq ${categoryId}`,
  SEARCH_NEWS_TITLE: (keyword: string) => `${ODATA_PARAMS.FILTER}=contains(NewsTitle, '${keyword}')`,
  SEARCH_NEWS_CONTENT: (keyword: string) => `${ODATA_PARAMS.FILTER}=contains(NewsContent, '${keyword}')`,
  ACTIVE_NEWS_ONLY: `${ODATA_PARAMS.FILTER}=NewsStatus eq 'Active'`,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
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
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  NEWS_TITLE_MAX_LENGTH: 200,
  HEADLINE_MAX_LENGTH: 500,
  NEWS_SOURCE_MAX_LENGTH: 200,
  CATEGORY_NAME_MAX_LENGTH: 100,
  CATEGORY_DESCRIPTION_MAX_LENGTH: 500,
  TAG_NAME_MAX_LENGTH: 50,
  TAG_NOTE_MAX_LENGTH: 200,
  ACCOUNT_NAME_MAX_LENGTH: 100,
  ACCOUNT_EMAIL_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 6,
} as const; 