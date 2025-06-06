import { trashService } from '@/lib/api-services';
import { TrashItem, TrashStatistics } from '@/types/api';
import { useCallback, useEffect, useState } from 'react';

export function useTrash() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [statistics, setStatistics] = useState<TrashStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrashData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [trashItems, stats] = await Promise.all([
        trashService.getTrashItems(),
        trashService.getTrashStatistics()
      ]);
      setItems(trashItems);
      setStatistics(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trash data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreItem = useCallback(async (item: TrashItem) => {
    try {
      await trashService.restoreItem(item);
      await fetchTrashData(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore item';
      setError(errorMessage);
      throw err;
    }
  }, [fetchTrashData]);

  const permanentDelete = useCallback(async (item: TrashItem) => {
    try {
      await trashService.permanentDelete(item);
      await fetchTrashData(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item permanently';
      setError(errorMessage);
      throw err;
    }
  }, [fetchTrashData]);

  const emptyTrash = useCallback(async () => {
    try {
      await trashService.emptyTrash();
      await fetchTrashData(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to empty trash';
      setError(errorMessage);
      throw err;
    }
  }, [fetchTrashData]);

  const softDeleteNews = useCallback(async (id: number) => {
    try {
      await trashService.softDeleteNews(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move news to trash';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const softDeleteCategory = useCallback(async (id: number) => {
    try {
      await trashService.softDeleteCategory(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move category to trash';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const softDeleteTag = useCallback(async (id: number) => {
    try {
      await trashService.softDeleteTag(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move tag to trash';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const softDeleteAccount = useCallback(async (id: number) => {
    try {
      await trashService.softDeleteAccount(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move account to trash';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTrashData();
  }, [fetchTrashData]);

  return {
    items,
    statistics,
    loading,
    error,
    fetchTrashData,
    restoreItem,
    permanentDelete,
    emptyTrash,
    softDeleteNews,
    softDeleteCategory,
    softDeleteTag,
    softDeleteAccount,
    clearError: () => setError(null)
  };
}

// Hook for checking if item is in trash
export function useIsInTrash() {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);

  useEffect(() => {
    const loadTrashItems = async () => {
      try {
        const items = await trashService.getTrashItems();
        setTrashItems(items);
      } catch (error) {
        console.error('Failed to load trash items:', error);
      }
    };

    loadTrashItems();
  }, []);

  const isInTrash = useCallback((type: string, id: number) => {
    return trashItems.some(item => item.type === type && item.id === id);
  }, [trashItems]);

  return { isInTrash, refreshTrashItems: () => setTrashItems([]) };
} 