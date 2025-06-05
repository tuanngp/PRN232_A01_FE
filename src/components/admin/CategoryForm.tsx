'use client';

import { categoryService } from '@/lib/api-services';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/api';
import { useEffect, useState } from 'react';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormData {
  categoryName: string;
  categoryDescription: string;
  parentCategoryId: number | null;
  isActive: boolean;
}

interface FormErrors {
  categoryName?: string;
  categoryDescription?: string;
  parentCategoryId?: string;
}

export function CategoryForm({ category, onSubmit, onCancel, isLoading = false }: CategoryFormProps) {
  const [formData, setFormData] = useState<FormData>({
    categoryName: '',
    categoryDescription: '',
    parentCategoryId: null,
    isActive: true
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        categoryName: category.categoryName,
        categoryDescription: category.categoryDescription || '',
        parentCategoryId: category.parentCategoryId || null,
        isActive: category.isActive
      });
    }
  }, [category]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const allCategories = await categoryService.getAllCategories();
      
      // Exclude current category from parent options to prevent circular reference
      const availableCategories = category 
        ? allCategories.filter(cat => cat.categoryId !== category.categoryId)
        : allCategories;
      
      setCategories(availableCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.categoryName.trim()) {
      newErrors.categoryName = 'Category name is required';
    } else if (formData.categoryName.length > 100) {
      newErrors.categoryName = 'Category name must be 100 characters or less';
    }

    if (formData.categoryDescription && formData.categoryDescription.length > 500) {
      newErrors.categoryDescription = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (category) {
        // Update existing category
        const updateData: UpdateCategoryDto = {
          categoryName: formData.categoryName,
          categoryDescription: formData.categoryDescription || undefined,
          parentCategoryId: formData.parentCategoryId || undefined,
          isActive: formData.isActive
        };
        await onSubmit(updateData);
      } else {
        // Create new category
        const createData: CreateCategoryDto = {
          categoryName: formData.categoryName,
          categoryDescription: formData.categoryDescription || undefined,
          parentCategoryId: formData.parentCategoryId || undefined
        };
        await onSubmit(createData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    let value: any = e.target.value;
    
    if (field === 'isActive') {
      value = (e.target as HTMLInputElement).checked;
    } else if (field === 'parentCategoryId') {
      value = e.target.value ? parseInt(e.target.value) : null;
    }
      
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Name */}
      <div>
        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
          Category Name *
        </label>
        <input
          type="text"
          id="categoryName"
          value={formData.categoryName}
          onChange={handleInputChange('categoryName')}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.categoryName ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter category name"
          disabled={isLoading}
          required
        />
        {errors.categoryName && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryName}</p>
        )}
      </div>

      {/* Category Description */}
      <div>
        <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="categoryDescription"
          value={formData.categoryDescription}
          onChange={handleInputChange('categoryDescription')}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.categoryDescription ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter category description (optional)"
          disabled={isLoading}
        />
        {errors.categoryDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryDescription}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Maximum 500 characters
        </p>
      </div>

      {/* Parent Category */}
      <div>
        <label htmlFor="parentCategoryId" className="block text-sm font-medium text-gray-700 mb-2">
          Parent Category
        </label>
        <select
          id="parentCategoryId"
          value={formData.parentCategoryId || ''}
          onChange={handleInputChange('parentCategoryId')}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.parentCategoryId ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          disabled={isLoading || loadingCategories}
        >
          <option value="">No parent category (Root level)</option>
          {categories.map(cat => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.categoryName}
            </option>
          ))}
        </select>
        {errors.parentCategoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.parentCategoryId}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Optional: Select a parent category to create a subcategory
        </p>
      </div>

      {/* Active Status (only for updates) */}
      {category && (
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={handleInputChange('isActive')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-gray-700">Active Category</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Inactive categories will not be visible to users
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading && (
            <span className="material-icons animate-spin text-sm mr-2">refresh</span>
          )}
          {category ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}

export default CategoryForm; 