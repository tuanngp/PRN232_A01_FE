// API Response Types cho FU News System

export interface NewsArticle {
  newsArticleId: number;
  newsTitle: string;
  headline?: string;
  newsContent?: string;
  newsSource?: string;
  categoryId: number;
  categoryName: string;
  createdDate: string;
  newsStatus: number;
  createdBy?: {
    accountId: number;
    accountName: string;
  };
  tags?: Tag[];
}

export interface Category {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  parentCategoryId?: number;
  isActive: boolean;
  subCategories?: Category[];
}

export interface Tag {
  tagId: number;
  tagName: string;
  note?: string;
}

export interface SystemAccount {
  accountId: number;
  accountName: string;
  accountEmail: string;
  accountRole: number; // 0=Admin, 1=Staff
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accountRole: number;
  accountName: string;
}

export interface NewsArticleRequest {
  newsTitle: string;
  headline?: string;
  newsContent: string;
  newsSource?: string;
  categoryId: number;
  newsStatus: number;
  tags?: number[];
}

export interface CategoryRequest {
  categoryName: string;
  categoryDescription?: string;
  parentCategoryId?: number;
  isActive: boolean;
}

export interface TagRequest {
  tagName: string;
  note?: string;
}

export interface SystemAccountRequest {
  accountName: string;
  accountEmail: string;
  accountPassword?: string;
  accountRole: number;
  isActive: boolean;
}

// Updated API Response types to match actual API structure
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

// Enums
export enum NewsStatus {
  Inactive = 0,
  Active = 1
}

export enum AccountRole {
  Admin = 0,
  Staff = 1
} 