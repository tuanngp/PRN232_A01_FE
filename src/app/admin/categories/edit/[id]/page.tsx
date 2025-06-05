'use client';

import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { categoryService } from '@/lib/api-services';
import { Category, UpdateCategoryDto } from '@/types/api';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);

  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateCategoryDto>({
    categoryName: '',
    categoryDescription: '',
    parentCategoryId: undefined,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category and all categories in parallel
      const [categoryData, categoriesData] = await Promise.all([
        categoryService.getCategoryById(categoryId),
        categoryService.getAllCategories()
      ]);

      setCategory(categoryData);
      setCategories(categoriesData.filter(cat => cat.categoryId !== categoryId)); // Exclude current category from parent options

      // Set form data from category
      setFormData({
        categoryName: categoryData.categoryName,
        categoryDescription: categoryData.categoryDescription || '',
        parentCategoryId: categoryData.parentCategoryId || undefined,
        isActive: categoryData.isActive
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load category data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.categoryName?.trim()) {
      setError('Category name is required.');
      return false;
    }

    if (formData.categoryName.length > 100) {
      setError('Category name must be 100 characters or less.');
      return false;
    }

    if (formData.categoryDescription && formData.categoryDescription.length > 500) {
      setError('Category description must be 500 characters or less.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update the category
      await categoryService.updateCategory(categoryId, formData);

      router.push('/admin/categories');
    } catch (error) {
      console.error('Failed to update category:', error);
      setError('Failed to update category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/categories');
  };

  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  if (!category) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="text-center py-12">
            <span className="material-icons text-6xl text-gray-300 mb-4">category</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h2>
            <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Categories
            </button>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <h1 className="text-black text-4xl font-bold leading-tight">Edit Category</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="material-icons text-red-500 mr-2">error</span>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={formData.categoryName}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                placeholder="Enter category name..."
                maxLength={100}
              />
            </div>

            {/* Category Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.categoryDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryDescription: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 resize-none"
                placeholder="Enter category description..."
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.categoryDescription?.length || 0}/500 characters
              </p>
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category
              </label>
              <select
                value={formData.parentCategoryId || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  parentCategoryId: e.target.value ? Number(e.target.value) : undefined 
                }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
              >
                <option value="">No parent (Root category)</option>
                {categories.map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active Category
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Inactive categories won't be available for new articles
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="material-icons animate-spin">sync</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="material-icons">save</span>
                    Update Category
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}