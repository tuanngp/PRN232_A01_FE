import {
    authService,
    trashService
} from '@/lib/api-services';
import { AccountRole } from '@/types/api';
import { useCallback, useState } from 'react';

export interface DeleteOptions {
  showConfirmation?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface DeleteState {
  isDeleting: boolean;
  error: string | null;
}

export function useDelete() {
  const [state, setState] = useState<DeleteState>({
    isDeleting: false,
    error: null
  });

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.accountRole === AccountRole.Admin;

  // Generic delete function with error handling
  const executeDelete = useCallback(async (
    deleteFunction: () => Promise<void>,
    options: DeleteOptions = {}
  ) => {
    const { showConfirmation = true, onSuccess, onError } = options;

    if (showConfirmation) {
      const confirmed = window.confirm('Bạn có chắc chắn muốn xóa item này không?');
      if (!confirmed) return;
    }

    setState({ isDeleting: true, error: null });

    try {
      await deleteFunction();
      setState({ isDeleting: false, error: null });
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
      setState({ isDeleting: false, error: errorMessage });
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, []);

  // Hard delete function with admin check
  const executeHardDelete = useCallback(async (
    deleteFunction: () => Promise<void>,
    options: DeleteOptions = {}
  ) => {
    if (!isAdmin) {
      const error = new Error('Chỉ Admin mới có quyền xóa cứng');
      setState({ isDeleting: false, error: error.message });
      options.onError?.(error);
      return;
    }

    const confirmed = window.confirm(
      'CẢNH BÁO: Đây là thao tác xóa cứng và không thể khôi phục. Bạn có chắc chắn muốn tiếp tục?'
    );
    if (!confirmed) return;

    await executeDelete(deleteFunction, { ...options, showConfirmation: false });
  }, [isAdmin, executeDelete]);

  // News Article Delete Functions
  const softDeleteNews = useCallback(async (id: number, options?: DeleteOptions) => {
    await executeDelete(() => trashService.softDeleteNews(id), options);
  }, [executeDelete]);

  const hardDeleteNews = useCallback(async (id: number, options?: DeleteOptions) => {
    await executeHardDelete(() => trashService.hardDeleteNews(id), options);
  }, [executeHardDelete]);

  // Category Delete Functions
  const softDeleteCategory = useCallback(async (id: number, options?: DeleteOptions) => {
    await executeDelete(() => trashService.softDeleteCategory(id), options);
  }, [executeDelete]);

  const hardDeleteCategory = useCallback(async (id: number, options?: DeleteOptions) => {
    await executeHardDelete(() => trashService.hardDeleteCategory(id), options);
  }, [executeHardDelete]);

  // Tag Delete Functions
  const softDeleteTag = useCallback(async (id: number, options?: DeleteOptions) => {
    await executeDelete(() => trashService.softDeleteTag(id), options);
  }, [executeDelete]);

  const hardDeleteTag = useCallback(async (id: number, options?: DeleteOptions) => {
    await executeHardDelete(() => trashService.hardDeleteTag(id), options);
  }, [executeHardDelete]);

  // Account Delete Functions
  const softDeleteAccount = useCallback(async (id: number, options?: DeleteOptions) => {
    await executeDelete(() => trashService.softDeleteAccount(id), options);
  }, [executeDelete]);

  // NewsArticleTag Delete Function
  const removeTagFromArticle = useCallback(async (
    articleId: number, 
    tagId: number, 
    options?: DeleteOptions
  ) => {
    await executeDelete(
      () => trashService.removeTagFromArticle(articleId, tagId), 
      options
    );
  }, [executeDelete]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    // Soft delete functions
    softDeleteNews,
    softDeleteCategory,
    softDeleteTag,
    softDeleteAccount,
    // Hard delete functions
    hardDeleteNews,
    hardDeleteCategory,
    hardDeleteTag,
    // Special functions
    removeTagFromArticle,
    // Utility functions
    clearError,
    isAdmin
  };
}

// Hook for delete confirmation modal
export function useDeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    isHardDelete?: boolean;
  } | null>(null);

  const showConfirmation = useCallback((config: {
    title: string;
    message: string;
    onConfirm: () => void;
    isHardDelete?: boolean;
  }) => {
    setDeleteConfig(config);
    setIsOpen(true);
  }, []);

  const hideConfirmation = useCallback(() => {
    setIsOpen(false);
    setDeleteConfig(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (deleteConfig) {
      deleteConfig.onConfirm();
      hideConfirmation();
    }
  }, [deleteConfig, hideConfirmation]);

  return {
    isOpen,
    deleteConfig,
    showConfirmation,
    hideConfirmation,
    handleConfirm
  };
} 