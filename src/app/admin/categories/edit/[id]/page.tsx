'use client';

import { StaffRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Toast, ToastContainer } from '@/components/ui/Toast';
import { categoryService } from '@/lib/api-services';
import { Category, NewsStatus, UpdateCategoryDto } from '@/types/api';
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
  const [toasts, setToasts] = useState<any[]>([]);

  const [formData, setFormData] = useState<UpdateCategoryDto>({
    categoryName: '',
    categoryDescription: '',
    parentCategoryId: undefined,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  const showToast = (variant: 'success' | 'error' | 'warning' | 'info', title: string, description: string) => {
    const newToast = {
      id: Date.now().toString(),
      title,
      description,
      variant,
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

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
      showToast('error', 'Error', 'Failed to load category data');
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

      showToast('success', 'Success!', 'Category updated successfully');
      
      setTimeout(() => {
        router.push('/admin/categories');
      }, 1000);
    } catch (error) {
      console.error('Failed to update category:', error);
      setError('Failed to update category. Please try again.');
      showToast('error', 'Error', 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/categories');
  };

  if (loading) {
    return (
      <StaffRoute>
        <AdminLayout>
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <Skeleton variant="button" width="100px" />
              <div>
                <Skeleton variant="title" width="250px" />
                <Skeleton variant="text" width="180px" />
              </div>
            </div>
            
            <div className="space-y-8">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </AdminLayout>
      </StaffRoute>
    );
  }

  if (!category) {
    return (
      <StaffRoute>
        <AdminLayout>
          <div className="max-w-4xl mx-auto">
            <Card variant="elevated" className="text-center py-16 animate-scale-in">
              <CardContent>
                <span className="material-icons text-6xl text-gray-300 mb-4 block">category</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h2>
                <p className="text-gray-600 mb-6">The category you're looking for doesn't exist or has been removed.</p>
                <Button
                  variant="primary"
                  onClick={handleCancel}
                  icon={<span className="material-icons">arrow_back</span>}
                >
                  Back to Categories
                </Button>
              </CardContent>
            </Card>
          </div>
        </AdminLayout>
      </StaffRoute>
    );
  }

  return (
    <StaffRoute>
      <AdminLayout>
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="md"
              onClick={handleCancel}
              icon={<span className="material-icons">arrow_back</span>}
              className="p-3"
            >
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Edit Category
              </h1>
              <p className="text-gray-600 mt-2">Update category information and settings</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge 
                status={category.isActive ? NewsStatus.Active : NewsStatus.Inactive} 
                variant="modern" 
              />
              <span className="text-sm text-gray-500">
                ID: {category.categoryId}
              </span>
            </div>
          </div>

          {error && (
            <Card variant="elevated" className="mb-6 border-red-200 bg-red-50 animate-slide-down">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-red-500">error</span>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card variant="elevated" hover className="animate-slide-up">
              <CardHeader gradient>
                <CardTitle size="lg" gradient>📁 Basic Information</CardTitle>
                <CardDescription>Update the main details of your category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Input
                  label="Category Name"
                  variant="floating"
                  size="lg"
                  required
                  value={formData.categoryName}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryName: e.target.value }))}
                  placeholder="Enter category name..."
                  icon={<span className="material-icons">label</span>}
                  helperText={`${formData.categoryName?.length || 0}/100 characters`}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    value={formData.categoryDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryDescription: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none bg-white hover:border-gray-400"
                    placeholder="Enter category description..."
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>Optional: Provide a brief description of this category</span>
                    <span>{formData.categoryDescription?.length || 0}/500 characters</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
              <Card variant="gradient" hover>
                <CardHeader>
                  <CardTitle size="lg">⚙️ Category Settings</CardTitle>
                  <CardDescription>Configure category hierarchy and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Parent Category
                      </label>
                      <select
                        value={formData.parentCategoryId || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          parentCategoryId: e.target.value ? Number(e.target.value) : undefined 
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white hover:border-gray-400"
                      >
                        <option value="">No parent (Top-level category)</option>
                        {categories
                          .filter(cat => cat.isActive)
                          .map(cat => (
                            <option key={cat.categoryId} value={cat.categoryId}>
                              {cat.categoryName}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Status
                      </label>
                      <select
                        value={formData.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          isActive: e.target.value === 'active' 
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white hover:border-gray-400"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Stats */}
            {(category as any).newsArticles && (
              <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
                <Card variant="minimal" hover>
                  <CardHeader>
                    <CardTitle size="lg">📊 Category Statistics</CardTitle>
                    <CardDescription>Current usage and metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">
                          {(category as any).newsArticles?.length || 0}
                        </div>
                        <div className="text-sm text-blue-700 font-medium">Articles</div>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="text-2xl font-bold text-green-600">
                          {(category as any).subCategories?.length || 0}
                        </div>
                        <div className="text-sm text-green-700 font-medium">Subcategories</div>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600">
                          {new Date(category.createdDate || '').toLocaleDateString()}
                        </div>
                        <div className="text-sm text-purple-700 font-medium">Created</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action Buttons */}
            <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
              <Card variant="elevated">
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <p>Last updated: {new Date(category.modifiedDate || category.createdDate || '').toLocaleString()}</p>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleCancel}
                        disabled={saving}
                        icon={<span className="material-icons">close</span>}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="gradient"
                        size="lg"
                        loading={saving}
                        icon={<span className="material-icons">save</span>}
                      >
                        Update Category
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>

        {/* Toast Container */}
        <ToastContainer position="top-right">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              title={toast.title}
              description={toast.description}
              variant={toast.variant}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </ToastContainer>
      </AdminLayout>
    </StaffRoute>
  );
}