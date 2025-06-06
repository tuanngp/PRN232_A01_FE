'use client';

import { StaffRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';
import { DeleteDropdownMenu, SimpleDeleteButton } from '@/components/ui/DeleteDropdownMenu';
import { useDelete } from '@/hooks/useDelete';
import { authService, categoryService, newsService, tagService } from '@/lib/api-services';
import { AccountRole, Category, NewsArticle, Tag } from '@/types/api';
import { useEffect, useState } from 'react';

export default function DeleteDemoPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete functionality
  const deleteHook = useDelete();
  const currentUser = authService.getCurrentUser();
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isHardDelete: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isHardDelete: false,
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, newsData, tagsData] = await Promise.all([
        categoryService.getAllCategories(),
        newsService.getLatestNews(5),
        tagService.getAllTags()
      ]);
      
      setCategories(categoriesData.slice(0, 3));
      setNews(newsData.slice(0, 3));
      setTags(tagsData.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Category delete handlers
  const handleSoftDeleteCategory = (category: Category) => {
    deleteHook.softDeleteCategory(category.categoryId, {
      onSuccess: () => {
        alert('Category moved to trash successfully!');
        fetchData();
      },
      onError: (error) => {
        alert(`Failed to delete category: ${error.message}`);
      },
      showConfirmation: false
    });
  };

  const handleHardDeleteCategory = (category: Category) => {
    deleteHook.hardDeleteCategory(category.categoryId, {
      onSuccess: () => {
        alert('Category permanently deleted!');
        fetchData();
      },
      onError: (error) => {
        alert(`Failed to permanently delete category: ${error.message}`);
      },
      showConfirmation: false
    });
  };

  // News delete handlers
  const handleSoftDeleteNews = (article: NewsArticle) => {
    deleteHook.softDeleteNews(article.newsArticleId, {
      onSuccess: () => {
        alert('News article moved to trash successfully!');
        fetchData();
      },
      onError: (error) => {
        alert(`Failed to delete news: ${error.message}`);
      },
      showConfirmation: false
    });
  };

  const handleHardDeleteNews = (article: NewsArticle) => {
    deleteHook.hardDeleteNews(article.newsArticleId, {
      onSuccess: () => {
        alert('News article permanently deleted!');
        fetchData();
      },
      onError: (error) => {
        alert(`Failed to permanently delete news: ${error.message}`);
      },
      showConfirmation: false
    });
  };

  // Tag delete handlers
  const handleSoftDeleteTag = (tag: Tag) => {
    deleteHook.softDeleteTag(tag.tagId, {
      onSuccess: () => {
        alert('Tag moved to trash successfully!');
        fetchData();
      },
      onError: (error) => {
        alert(`Failed to delete tag: ${error.message}`);
      },
      showConfirmation: false
    });
  };

  const handleHardDeleteTag = (tag: Tag) => {
    deleteHook.hardDeleteTag(tag.tagId, {
      onSuccess: () => {
        alert('Tag permanently deleted!');
        fetchData();
      },
      onError: (error) => {
        alert(`Failed to permanently delete tag: ${error.message}`);
      },
      showConfirmation: false
    });
  };

  // Modal confirmation handlers
  const showDeleteConfirmation = (
    title: string,
    message: string,
    isHardDelete: boolean,
    onConfirm: () => void
  ) => {
    setDeleteModal({
      isOpen: true,
      title,
      message,
      isHardDelete,
      onConfirm
    });
  };

  const hideDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      title: '',
      message: '',
      isHardDelete: false,
      onConfirm: () => {}
    });
  };

  if (loading) {
    return (
      <StaffRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading demo data...</div>
          </div>
        </AdminLayout>
      </StaffRoute>
    );
  }

  return (
    <StaffRoute>
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Delete Functions Demo</h1>
            <p className="text-gray-600">
              This page demonstrates the delete functionality with both soft delete and hard delete options.
              {deleteHook.isAdmin ? ' As an Admin, you can use both functions.' : ' As a Staff member, you can only use soft delete.'}
            </p>
          </div>

          {/* Current User Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Current User</h3>
            <p className="text-blue-700">
              Name: {currentUser?.accountName || 'Unknown'} | 
              Role: {currentUser?.accountRole === AccountRole.Admin ? 'Admin' : 'Staff'} |
              Can Hard Delete: {deleteHook.isAdmin ? 'Yes' : 'No'}
            </p>
          </div>

          {/* Categories Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.categoryId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{category.categoryName}</h3>
                    <p className="text-sm text-gray-500">{category.categoryDescription}</p>
                  </div>
                  <div className="flex gap-2">
                    <DeleteDropdownMenu
                      userRole={currentUser?.accountRole}
                      onSoftDelete={() => 
                        showDeleteConfirmation(
                          'Delete Category',
                          `Are you sure you want to move "${category.categoryName}" to trash?`,
                          false,
                          () => handleSoftDeleteCategory(category)
                        )
                      }
                      onHardDelete={deleteHook.isAdmin ? () => 
                        showDeleteConfirmation(
                          'Permanently Delete Category',
                          `Are you sure you want to permanently delete "${category.categoryName}"? This action cannot be undone.`,
                          true,
                          () => handleHardDeleteCategory(category)
                        ) : undefined
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* News Articles Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">News Articles</h2>
            <div className="space-y-4">
              {news.map((article) => (
                <div key={article.newsArticleId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{article.newsTitle}</h3>
                    <p className="text-sm text-gray-500">
                      {article.newsContent?.slice(0, 100)}...
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <SimpleDeleteButton
                      variant="soft"
                      size="sm"
                      onDelete={() => 
                        showDeleteConfirmation(
                          'Delete News Article',
                          `Are you sure you want to move "${article.newsTitle}" to trash?`,
                          false,
                          () => handleSoftDeleteNews(article)
                        )
                      }
                    />
                    {deleteHook.isAdmin && (
                      <SimpleDeleteButton
                        variant="hard"
                        size="sm"
                        onDelete={() => 
                          showDeleteConfirmation(
                            'Permanently Delete News Article',
                            `Are you sure you want to permanently delete "${article.newsTitle}"? This action cannot be undone.`,
                            true,
                            () => handleHardDeleteNews(article)
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
            <div className="space-y-4">
              {tags.map((tag) => (
                <div key={tag.tagId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{tag.tagName}</h3>
                    <p className="text-sm text-gray-500">{tag.note}</p>
                  </div>
                  <div className="flex gap-2">
                    <DeleteDropdownMenu
                      userRole={currentUser?.accountRole}
                      onSoftDelete={() => 
                        showDeleteConfirmation(
                          'Delete Tag',
                          `Are you sure you want to move tag "${tag.tagName}" to trash?`,
                          false,
                          () => handleSoftDeleteTag(tag)
                        )
                      }
                      onHardDelete={deleteHook.isAdmin ? () => 
                        showDeleteConfirmation(
                          'Permanently Delete Tag',
                          `Are you sure you want to permanently delete tag "${tag.tagName}"? This action cannot be undone.`,
                          true,
                          () => handleHardDeleteTag(tag)
                        ) : undefined
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Status */}
          {deleteHook.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-2">Error</h3>
              <p className="text-red-700">{deleteHook.error}</p>
              <button 
                onClick={deleteHook.clearError}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Clear Error
              </button>
            </div>
          )}

          {deleteHook.isDeleting && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-yellow-700">Processing delete operation...</p>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          title={deleteModal.title}
          message={deleteModal.message}
          isHardDelete={deleteModal.isHardDelete}
          isLoading={deleteHook.isDeleting}
          onConfirm={deleteModal.onConfirm}
          onCancel={hideDeleteModal}
        />
      </AdminLayout>
    </StaffRoute>
  );
} 