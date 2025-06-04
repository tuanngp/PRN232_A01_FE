// Specialized News Hooks for FU News System
// Provides optimized hooks for news-related operations

import { useState, useEffect, useCallback } from 'react';
import { NewsArticle } from '@/types/api';
import { newsService, utilityService } from '@/lib/api-services';

interface UseNewsResult {
  news: NewsArticle[];
  loading: boolean;
  error: string | null;
  refreshNews: () => Promise<void>;
}

interface UseNewsWithPaginationResult extends UseNewsResult {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

interface UseSingleNewsResult {
  news: NewsArticle | null;
  loading: boolean;
  error: string | null;
  refreshNews: () => Promise<void>;
}

// Hook for getting latest news (homepage)
export function useLatestNews(limit = 10): UseNewsResult {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await newsService.getLatestNews(limit);
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    loading,
    error,
    refreshNews: fetchNews
  };
}

// Hook for getting news by category with pagination
export function useNewsByCategory(
  categoryId: number, 
  initialPage = 1, 
  limit = 10
): UseNewsWithPaginationResult {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const fetchNews = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const [newsData, count] = await Promise.all([
        newsService.getNewsByCategory(categoryId, page, limit),
        utilityService.getNewsCount(categoryId)
      ]);
      
      setNews(newsData);
      setTotalCount(count);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, limit]);

  useEffect(() => {
    fetchNews(initialPage);
  }, [fetchNews, initialPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchNews(page);
    }
  }, [fetchNews, totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [hasNextPage, currentPage, goToPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      goToPage(currentPage - 1);
    }
  }, [hasPrevPage, currentPage, goToPage]);

  return {
    news,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    refreshNews: () => fetchNews(currentPage),
    goToPage,
    nextPage,
    prevPage
  };
}

// Hook for getting a single news article by ID
export function useNewsById(id: number): UseSingleNewsResult {
  const [news, setNews] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await newsService.getNewsById(id);
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news article');
      setNews(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && id > 0) {
      fetchNews();
    }
  }, [fetchNews, id]);

  return {
    news,
    loading,
    error,
    refreshNews: fetchNews
  };
}

// Hook for searching news with debouncing
export function useNewsSearch(
  keyword: string,
  debounceMs = 300,
  initialPage = 1,
  limit = 10
): UseNewsWithPaginationResult {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Debounce the search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [keyword, debounceMs]);

  const fetchNews = useCallback(async (searchKeyword: string, page: number) => {
    if (!searchKeyword.trim()) {
      setNews([]);
      setTotalCount(0);
      setCurrentPage(1);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [newsData, count] = await Promise.all([
        newsService.searchNews(searchKeyword, page, limit),
        utilityService.getNewsCount(undefined, searchKeyword)
      ]);
      
      setNews(newsData);
      setTotalCount(count);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchNews(debouncedKeyword, 1);
  }, [debouncedKeyword, fetchNews]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchNews(debouncedKeyword, page);
    }
  }, [fetchNews, debouncedKeyword, totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [hasNextPage, currentPage, goToPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      goToPage(currentPage - 1);
    }
  }, [hasPrevPage, currentPage, goToPage]);

  return {
    news,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    refreshNews: () => fetchNews(debouncedKeyword, currentPage),
    goToPage,
    nextPage,
    prevPage
  };
}

// Hook for getting featured news (banner/slider)
export function useFeaturedNews(limit = 5): UseNewsResult {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await newsService.getFeaturedNews();
      setNews(data.slice(0, limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch featured news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    loading,
    error,
    refreshNews: fetchNews
  };
}

// Hook for admin/staff: getting all news with pagination
export function useAllNewsAdmin(
  initialPage = 1,
  limit = 10
): UseNewsWithPaginationResult {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const fetchNews = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // For admin, get all news including inactive
      const newsData = await newsService.getAllNews(page, limit);
      
      // Note: For count, you might need a separate admin endpoint
      // For now, using the same count logic
      const count = await utilityService.getNewsCount();
      
      setNews(newsData);
      setTotalCount(count);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchNews(initialPage);
  }, [fetchNews, initialPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchNews(page);
    }
  }, [fetchNews, totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [hasNextPage, currentPage, goToPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      goToPage(currentPage - 1);
    }
  }, [hasPrevPage, currentPage, goToPage]);

  return {
    news,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    refreshNews: () => fetchNews(currentPage),
    goToPage,
    nextPage,
    prevPage
  };
} 