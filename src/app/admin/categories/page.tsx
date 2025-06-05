'use client';

import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { Button, Card, CardContent, CardHeader, CardTitle, Modal } from '@/components/ui';
import { categoryService } from '@/lib/api-services';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/api';
import { useEffect, useState } from 'react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryDto>({
    categoryName: '',
    categoryDescription: '',
    parentCategoryId: undefined
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategoryTree();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoryService.createCategory(formData);
      setShowCreateModal(false);
      setFormData({ categoryName: '', categoryDescription: '', parentCategoryId: undefined });
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  // Handle edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    
    try {
      const updateData: UpdateCategoryDto = {
        categoryName: formData.categoryName,
        categoryDescription: formData.categoryDescription,
        parentCategoryId: formData.parentCategoryId
      };
      
      await categoryService.updateCategory(selectedCategory.categoryId, updateData);
      setShowEditModal(false);
      setSelectedCategory(null);
      setFormData({ categoryName: '', categoryDescription: '', parentCategoryId: undefined });
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedCategory) return;
    
    try {
      await categoryService.deleteCategory(selectedCategory.categoryId);
      setShowDeleteModal(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (categoryId: number) => {
    try {
      await categoryService.toggleCategoryStatus(categoryId);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle status');
    }
  };

  // Open edit modal
  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      categoryName: category.categoryName,
      categoryDescription: category.categoryDescription || '',
      parentCategoryId: category.parentCategoryId
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  // Render category tree
  const renderCategory = (category: Category, level = 0) => {
    return (
      <div key={category.categoryId}>
        <div className={`border border-gray-200 rounded-lg p-4 mb-2 ${level > 0 ? 'ml-8' : ''}`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.categoryName}
              </h3>
              {category.categoryDescription && (
                <p className="text-gray-600 text-sm mb-2">{category.categoryDescription}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Level: {level}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  category.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                {category.newsArticles && (
                  <span>Articles: {category.newsArticles.length}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {/* Toggle Status */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus(category.categoryId)}
              >
                {category.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              
              {/* Edit */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(category)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
              
              {/* Delete */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDeleteModal(category)}
                className="text-red-600 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Render subcategories */}
        {category.subCategories && category.subCategories.map(subCategory => 
          renderCategory(subCategory, level + 1)
        )}
      </div>
    );
  };

  return (
    <AdminRoute>
      <div className="bg-gray-50 min-h-screen" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
                  <p className="text-gray-600 mt-2">Manage news categories</p>
                </div>
                <Button 
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Category
                </Button>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>Categories Tree</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 h-20 rounded" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No categories found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map(category => renderCategory(category))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Category"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.categoryName}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryName: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.categoryDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryDescription: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.parentCategoryId || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  parentCategoryId: e.target.value ? Number(e.target.value) : undefined 
                }))}
              >
                <option value="">No Parent (Root Category)</option>
                {categories.map(category => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Category"
        >
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.categoryName}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryName: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.categoryDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryDescription: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.parentCategoryId || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  parentCategoryId: e.target.value ? Number(e.target.value) : undefined 
                }))}
              >
                <option value="">No Parent (Root Category)</option>
                {categories
                  .filter(cat => cat.categoryId !== selectedCategory?.categoryId)
                  .map(category => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirm Delete"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete "{selectedCategory?.categoryName}"? This action cannot be undone.
            </p>
            {selectedCategory?.newsArticles && selectedCategory.newsArticles.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                Warning: This category has {selectedCategory.newsArticles.length} associated articles.
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminRoute>
  );
} 