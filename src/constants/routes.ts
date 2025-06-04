// Route Constants cho FU News System

export const ROUTES = {
  // Public Routes
  HOME: '/',
  CATEGORY: (id: number) => `/category/${id}`,
  ARTICLE: (id: number) => `/article/${id}`,
  SEARCH: '/search',
  NEWS: '/news',
  TAG: (id: number) => `/tag/${id}`,
  
  // Auth Routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_NEWS: '/admin/news',
  ADMIN_NEWS_CREATE: '/admin/news/create',
  ADMIN_NEWS_EDIT: (id: number) => `/admin/news/${id}/edit`,
  ADMIN_TAGS: '/admin/tags',
  ADMIN_ACCOUNTS: '/admin/accounts',
  
  // Staff Routes
  STAFF_DASHBOARD: '/staff',
} as const;

// Route Groups (for middleware)
export const ROUTE_GROUPS = {
  PUBLIC: ['/', '/category', '/article', '/search', '/news', '/tag'],
  AUTH: ['/auth'],
  ADMIN: ['/admin'],
  STAFF: ['/staff'],
  PROTECTED: ['/admin', '/staff'],
} as const;

// Route Titles for breadcrumbs
export const ROUTE_TITLES = {
  [ROUTES.HOME]: 'Trang chủ',
  [ROUTES.NEWS]: 'Tin tức',
  [ROUTES.SEARCH]: 'Tìm kiếm',
  [ROUTES.LOGIN]: 'Đăng nhập',
  [ROUTES.REGISTER]: 'Đăng ký',
  [ROUTES.ADMIN_DASHBOARD]: 'Tổng quan',
  [ROUTES.ADMIN_CATEGORIES]: 'Quản lý danh mục',
  [ROUTES.ADMIN_NEWS]: 'Quản lý tin tức',
  [ROUTES.ADMIN_NEWS_CREATE]: 'Tạo tin tức mới',
  [ROUTES.ADMIN_TAGS]: 'Quản lý thẻ',
  [ROUTES.ADMIN_ACCOUNTS]: 'Quản lý tài khoản',
  [ROUTES.STAFF_DASHBOARD]: 'Bảng điều khiển',
} as const; 