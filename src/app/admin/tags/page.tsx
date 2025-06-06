'use client';

import { CreateTagModal } from '@/components/admin';
import { TagsTable } from '@/components/admin/TagsTable';
import { StaffRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { tagService } from '@/lib/api-services';
import { Tag } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminTagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use OData query to get tags with related data
      const query = '$filter=IsDeleted eq false&$orderby=CreatedDate desc';
      const data = await tagService.getTagsOData(query);
      setTags(data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      setError('Failed to load tags. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchTags();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Search in tag name and note using OData
      const query = `$filter=contains(tolower(TagName), '${searchTerm.toLowerCase()}') or contains(tolower(Note), '${searchTerm.toLowerCase()}')&$orderby=TagName asc`;
      const data = await tagService.getTagsOData(query);
      setTags(data);
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

  const handleEdit = (tag: Tag) => {
    router.push(`/admin/tags/edit/${tag.tagId}`);
  };

  const handleDelete = async (tagId: number) => {
    const tag = tags.find(t => t.tagId === tagId);
    const tagName = tag?.tagName || 'this tag';
    
    if (!confirm(`Are you sure you want to move "${tagName}" to trash? This will save the tag information for recovery.`)) {
      return;
    }

    try {
      // Import trashService and use soft delete
      const { trashService } = await import('@/lib/api-services');
      await trashService.softDeleteTag(tagId);
      // Then delete from backend (since we saved it in localStorage)
      await tagService.deleteTag(tagId);
      // Remove tag from local state immediately for better UX
      setTags(prev => prev.filter(t => t.tagId !== tagId));
      console.log('✅ Tag moved to trash successfully:', tagName);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to move tag to trash. This tag may be associated with articles.');
      // Refresh the list in case of error to ensure data consistency
      fetchTags();
    }
  };

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = (newTag: Tag) => {
    // Add the new tag to the current list
    setTags(prev => [newTag, ...prev]);
    // Clear search term if any
    setSearchTerm('');
    // Show success message
    console.log('✅ Tag created successfully:', newTag.tagName);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  return (
    <StaffRoute>
      <AdminLayout>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <p className="text-black text-4xl font-bold leading-tight">Tags</p>
          <button 
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-full h-10 px-6 bg-black text-white text-base font-medium leading-normal shadow-md hover:bg-gray-800 transition-colors"
          >
            <span className="material-icons">add_circle</span>
            <span className="truncate">New Tag</span>
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
                placeholder="Search tags by name or note..."
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
                onClick={fetchTags}
                className="ml-auto text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <TagsTable
          tags={tags}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={loading}
        />

        {/* Create Tag Modal */}
        <CreateTagModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          onSuccess={handleCreateSuccess}
        />
      </AdminLayout>
    </StaffRoute>
  );
} 