// Category hooks for FU News System
// Provides optimized hooks for category operations

import { categoryService } from '@/lib/api-services';
import { Category } from '@/types/api';
import { useCallback, useEffect, useState } from 'react';

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

interface UseSingleCategoryResult {
  category: Category | null;
  loading: boolean;
  error: string | null;
  refreshCategory: () => Promise<void>;
}

// Hook for getting active categories (for public navigation)
export function useActiveCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getActiveCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories
  };
}

// Hook for admin: getting all categories
export function useAllCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories
  };
}

// Hook for getting a single category by ID
export function useCategoryById(id: number): UseSingleCategoryResult {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategoryById(id);
      setCategory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category');
      setCategory(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && id > 0) {
      fetchCategory();
    }
  }, [fetchCategory, id]);

  return {
    category,
    loading,
    error,
    refreshCategory: fetchCategory
  };
}

// Hook for managing categories (admin operations)
export function useCategoryManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await categoryService.createCategory(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: number, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await categoryService.updateCategory(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await categoryService.deleteCategory(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory
  };
} 