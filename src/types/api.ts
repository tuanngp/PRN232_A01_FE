// API Types cho FU News Management System - Generated from Swagger

// ========== ENUMS ==========
export enum AccountRole {
  Admin = 0,
  Staff = 1,
  Lecturer = 2
}

export enum NewsStatus {
  Inactive = 0,
  Active = 1
}

// ========== REQUEST DTOs ==========
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface RevokeTokenRequest {
  refreshToken: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface CreateCategoryDto {
  categoryName: string;
  categoryDescription?: string;
  parentCategoryId?: number;
}

export interface UpdateCategoryDto {
  categoryName?: string;
  categoryDescription?: string;
  parentCategoryId?: number;
  isActive?: boolean;
}

export interface CreateNewsArticleDto {
  newsTitle: string;
  headline?: string;
  newsContent: string;
  newsSource?: string;
  categoryId: number;
}

export interface UpdateNewsArticleDto {
  newsTitle?: string;
  headline?: string;
  newsContent?: string;
  newsSource?: string;
  categoryId?: number;
}

export interface ChangeNewsStatusDto {
  status: NewsStatus;
}

export interface AddTagToArticleDto {
  tagId: number;
}

export interface ReplaceTagsDto {
  tagIds: number[];
}

export interface AddMultipleTagsDto {
  tagIds: number[];
}

export interface CreateSystemAccountDto {
  accountName: string;
  accountEmail: string;
  accountPassword: string;
  accountRole: AccountRole;
}

export interface UpdateSystemAccountDto {
  accountName?: string;
  accountEmail?: string;
  accountRole?: AccountRole;
  isActive?: boolean;
}

export interface UpdateProfileDto {
  accountName?: string;
  accountEmail?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ResetPasswordDto {
  newPassword: string;
}

export interface CreateTagDto {
  tagName: string;
  note?: string;
}

export interface UpdateTagDto {
  tagName?: string;
  note?: string;
}

export interface CreateBulkTagsDto {
  tagNames: string[];
  note?: string;
}

// ========== DOMAIN ENTITIES ==========
export interface NewsArticle {
  newsArticleId: number;
  newsTitle: string;
  headline?: string;
  newsContent: string;
  newsSource?: string;
  categoryId: number;
  newsStatus: NewsStatus;
  createdDate: string;
  modifiedDate?: string;
  createdBy?: SystemAccount;
  modifiedBy?: SystemAccount;
  category?: Category;
  newsArticleTags?: NewsArticleTag[] | { $id: string; $values: NewsArticleTag[] };
}

export interface Category {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  parentCategoryId?: number;
  isActive: boolean;
  createdDate?: string;
  modifiedDate?: string;
  parentCategory?: Category;
  subCategories?: Category[];
  newsArticles?: NewsArticle[];
}

export interface Tag {
  tagId: number;
  tagName: string;
  note?: string;
  createdDate?: string;
  modifiedDate?: string;
  newsArticles?: NewsArticle[];
}

export interface SystemAccount {
  accountId: number;
  accountName: string;
  accountEmail: string;
  accountRole: AccountRole;
  isActive: boolean;
  createdDate?: string;
  modifiedDate?: string;
  createdNewsArticles?: NewsArticle[];
  modifiedNewsArticles?: NewsArticle[];
}

export interface UserInfo {
  accountId: number;
  accountName: string;
  accountEmail: string;
  accountRole: AccountRole;
}

export interface NewsArticleTag {
  newsArticleId: number;
  tagId: number;
  newsArticle?: NewsArticle;
  tag?: Tag;
}

// ========== API RESPONSE TYPES ==========
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    $id: string;
    $values: T[];
  };
  timestamp: string;
  requestId: string;
}

export interface ApiSingleResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  requestId: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
  accessTokenExpires: string;
  refreshTokenExpires: string;
}

// ========== PAGINATION & SEARCH ==========
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchParams {
  keyword?: string;
  categoryId?: number;
  tagIds?: number[];
  status?: NewsStatus;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// ========== STATISTICS ==========
export interface TagStatistics {
  tagId: number;
  tagName: string;
  articleCount: number;
}

export interface AccountStatistics {
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  adminCount: number;
  staffCount: number;
  lecturerCount: number;
}

export interface NewsStatistics {
  totalArticles: number;
  activeArticles: number;
  inactiveArticles: number;
  articlesThisMonth: number;
  articlesThisWeek: number;
}

export interface CategoryStatistics {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  categoriesWithArticles: number;
}

// ========== LEGACY COMPATIBILITY ==========
// Keep some legacy types for backward compatibility
export interface NewsArticleRequest extends CreateNewsArticleDto {
  newsStatus?: NewsStatus;
  tags?: number[];
}

export interface CategoryRequest extends CreateCategoryDto {
  isActive?: boolean;
}

export interface TagRequest extends CreateTagDto {}

export interface SystemAccountRequest extends CreateSystemAccountDto {
  isActive?: boolean;
} 