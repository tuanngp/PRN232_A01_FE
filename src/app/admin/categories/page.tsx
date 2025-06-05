'use client';

import { CategoryForm } from '@/components/admin';
import { CategoriesTable } from '@/components/admin/CategoriesTable';
import { StaffRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ConfirmDialog, Modal } from '@/components/ui';
import { categoryService } from '@/lib/api-services';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use OData query to get categories with related data
      const query = '$orderby=CreatedDate desc';
      const data = await categoryService.getCategoriesOData(query);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCategories();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Search in category name and description using OData
      const query = `$expand=ParentCategory,SubCategories&$filter=contains(tolower(CategoryName), '${searchTerm.toLowerCase()}') or contains(tolower(CategoryDescription), '${searchTerm.toLowerCase()}')&$orderby=CategoryName asc`;
      const data = await categoryService.getCategoriesOData(query);
      setCategories(data);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCreateNew = () => {
    setSelectedCategory(null);
    setShowCreateModal(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteConfirm(true);
  };

  const handleToggleStatus = async (categoryId: number) => {
    try {
      await categoryService.toggleCategoryStatus(categoryId);
      await fetchCategories(); // Refresh the list
    } catch (error) {
      console.error('Toggle status failed:', error);
      alert('Failed to update category status. Please try again.');
    }
  };

  const handleCreateSubmit = async (data: CreateCategoryDto) => {
    try {
      setFormLoading(true);
      await categoryService.createCategory(data);
      setShowCreateModal(false);
      await fetchCategories();
    } catch (error) {
      console.error('Create category failed:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (data: UpdateCategoryDto) => {
    if (!selectedCategory) return;
    
    try {
      setFormLoading(true);
      await categoryService.updateCategory(selectedCategory.categoryId, data);
      setShowEditModal(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (error) {
      console.error('Update category failed:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    try {
      setDeleteLoading(true);
      await categoryService.deleteCategoryWithCheck(selectedCategory.categoryId);
      setShowDeleteConfirm(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (error) {
      console.error('Delete category failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete category. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteConfirm(false);
    setSelectedCategory(null);
  };

  return (
    <StaffRoute>
      <AdminLayout>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <p className="text-black text-4xl font-bold leading-tight">Category Management</p>
          <button 
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-full h-10 px-6 bg-black text-white text-base font-medium leading-normal shadow-md hover:bg-gray-800 transition-colors"
          >
            <span className="material-icons">add_circle</span>
            <span className="truncate">New Category</span>
          </button>
        </div>

        <div className="mb-6">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-full h-full shadow-sm">
              <div className="text-gray-500 flex bg-gray-100 items-center justify-center pl-4 rounded-l-full border border-gray-200 border-r-0">
                <span className="material-icons">search</span>
              </div>
              <input 
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full text-black focus:outline-0 focus:ring-2 focus:ring-black focus:ring-opacity-50 border border-gray-200 bg-gray-100 focus:border-gray-200 h-full placeholder:text-gray-500 px-4 text-base font-normal leading-normal" 
                placeholder="Search categories by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleSearch}
                className="px-4 bg-gray-100 border border-gray-200 border-l-0 rounded-r-full hover:bg-gray-200 transition-colors"
                title="Search"
              >
                <span className="material-icons text-gray-500">search</span>
              </button>
            </div>
          </label>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons text-red-500 mr-2">error</span>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchCategories}
                className="ml-auto text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <CategoriesTable
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          isLoading={loading}
        />

        {/* Create Category Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={closeModals}
          title="Create New Category"
          size="lg"
        >
          <CategoryForm
            onSubmit={handleCreateSubmit}
            onCancel={closeModals}
            isLoading={formLoading}
          />
        </Modal>

        {/* Edit Category Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={closeModals}
          title="Edit Category"
          size="lg"
        >
          <CategoryForm
            category={selectedCategory || undefined}
            onSubmit={handleEditSubmit}
            onCancel={closeModals}
            isLoading={formLoading}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={closeModals}
          onConfirm={handleDeleteConfirm}
          title="Delete Category"
          message={
            <div>
              <p className="mb-2">
                Are you sure you want to delete the category <strong>{selectedCategory?.categoryName}</strong>?
              </p>
              <p className="text-sm text-gray-600">
                This action cannot be undone. The category will be permanently deleted if it has no news articles.
              </p>
            </div>
          }
          confirmText="Delete Category"
          type="danger"
          isLoading={deleteLoading}
        />
      </AdminLayout>
    </StaffRoute>
  );
} 