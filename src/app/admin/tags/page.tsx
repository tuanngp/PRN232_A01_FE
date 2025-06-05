'use client';

import { TagsTable } from '@/components/admin/TagsTable';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
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

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use OData query to get tags with related data
      const query = '$orderby=CreatedDate desc';
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
    if (!confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      return;
    }

    try {
      await tagService.deleteTag(tagId);
      await fetchTags(); // Refresh the list
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete tag. This tag may be associated with articles.');
    }
  };

  const handleCreateNew = () => {
    router.push('/admin/tags/create');
  };

  return (
    <AdminRoute>
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
      </AdminLayout>
    </AdminRoute>
  );
} 