'use client';

import { TrashTable } from '@/components/admin/TrashTable';
import { StaffRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTrash } from '@/hooks/useTrash';
import { TrashItem } from '@/types/api';
import { useState } from 'react';

export default function TrashPage() {
  const {
    items,
    statistics,
    loading,
    error,
    fetchTrashData,
    restoreItem,
    permanentDelete,
    emptyTrash
  } = useTrash();

  const [selectedItem, setSelectedItem] = useState<TrashItem | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const handleRestore = async () => {
    if (!selectedItem) return;

    try {
      setActionLoading(true);
      await restoreItem(selectedItem);
      setShowRestoreConfirm(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error restoring item:', error);
      alert('Failed to restore item. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedItem) return;

    try {
      setActionLoading(true);
      await permanentDelete(selectedItem);
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      setActionLoading(true);
      await emptyTrash();
      setShowEmptyTrashConfirm(false);
    } catch (error) {
      console.error('Error emptying trash:', error);
      alert('Failed to empty trash. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    filterType === 'all' || item.type === filterType
  );

  const closeModals = () => {
    setShowRestoreConfirm(false);
    setShowDeleteConfirm(false);
    setShowEmptyTrashConfirm(false);
    setSelectedItem(null);
  };

  return (
    <StaffRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-black">Thùng Rác</h1>
              <p className="text-gray-600 mt-2">Quản lý các mục đã bị xóa</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchTrashData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                <span className="material-icons">refresh</span>
                Làm mới
              </button>
              {statistics && statistics.totalItems > 0 && (
                <button
                  onClick={() => setShowEmptyTrashConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <span className="material-icons">delete_forever</span>
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          {/* Statistics */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-gray-600">delete</span>
                  <div>
                    <p className="text-2xl font-bold">{statistics.totalItems}</p>
                    <p className="text-sm text-gray-600">Tổng cộng</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-blue-600">article</span>
                  <div>
                    <p className="text-2xl font-bold">{statistics.newsCount}</p>
                    <p className="text-sm text-gray-600">Tin tức</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-green-600">category</span>
                  <div>
                    <p className="text-2xl font-bold">{statistics.categoryCount}</p>
                    <p className="text-sm text-gray-600">Danh mục</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-orange-600">sell</span>
                  <div>
                    <p className="text-2xl font-bold">{statistics.tagCount}</p>
                    <p className="text-sm text-gray-600">Thẻ</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-purple-600">person</span>
                  <div>
                    <p className="text-2xl font-bold">{statistics.accountCount}</p>
                    <p className="text-sm text-gray-600">Tài khoản</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="news">Tin tức</option>
              <option value="category">Danh mục</option>
              <option value="tag">Thẻ</option>
              <option value="account">Tài khoản</option>
            </select>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="material-icons text-red-500 mr-2">error</span>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={fetchTrashData}
                  className="ml-auto text-red-600 hover:text-red-800 underline"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* Trash Table */}
          <TrashTable
            items={filteredItems}
            onRestore={(item) => {
              setSelectedItem(item);
              setShowRestoreConfirm(true);
            }}
            onPermanentDelete={(item) => {
              setSelectedItem(item);
              setShowDeleteConfirm(true);
            }}
            isLoading={loading}
          />

          {/* Restore Confirmation */}
          <ConfirmDialog
            isOpen={showRestoreConfirm}
            onClose={closeModals}
            onConfirm={handleRestore}
            title="Khôi phục mục"
            message={
              <div>
                <p className="mb-2">
                  Bạn có chắc muốn khôi phục <strong>{selectedItem?.title}</strong>?
                </p>
                <p className="text-sm text-gray-600">
                  Mục này sẽ được khôi phục và hiển thị lại trong hệ thống.
                </p>
              </div>
            }
            confirmText="Khôi phục"
            type="info"
            isLoading={actionLoading}
          />

          {/* Permanent Delete Confirmation */}
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            onClose={closeModals}
            onConfirm={handlePermanentDelete}
            title="Xóa vĩnh viễn"
            message={
              <div>
                <p className="mb-2">
                  Bạn có chắc muốn xóa vĩnh viễn <strong>{selectedItem?.title}</strong>?
                </p>
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Hành động này không thể hoàn tác!
                </p>
              </div>
            }
            confirmText="Xóa vĩnh viễn"
            type="danger"
            isLoading={actionLoading}
          />

          {/* Empty Trash Confirmation */}
          <ConfirmDialog
            isOpen={showEmptyTrashConfirm}
            onClose={closeModals}
            onConfirm={handleEmptyTrash}
            title="Xóa tất cả"
            message={
              <div>
                <p className="mb-2">
                  Bạn có chắc muốn xóa vĩnh viễn tất cả {statistics?.totalItems} mục trong thùng rác?
                </p>
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Hành động này không thể hoàn tác!
                </p>
              </div>
            }
            confirmText="Xóa tất cả"
            type="danger"
            isLoading={actionLoading}
          />
        </div>
      </AdminLayout>
    </StaffRoute>
  );
} 