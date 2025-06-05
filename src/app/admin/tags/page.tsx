'use client';

import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { Button, Card, CardContent, CardHeader, CardTitle, Modal } from '@/components/ui';
import { tagService } from '@/lib/api-services';
import { CreateTagDto, Tag, UpdateTagDto } from '@/types/api';
import { useEffect, useState } from 'react';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [formData, setFormData] = useState<CreateTagDto>({
    tagName: '',
    note: ''
  });

  // Fetch tags
  const fetchTags = async () => {
    try {
      setLoading(true);
      let data: Tag[];
      
      if (searchKeyword.trim()) {
        data = await tagService.searchTags(searchKeyword);
      } else {
        data = await tagService.getAllTags();
      }
      
      setTags(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [searchKeyword]);

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tagService.createTag(formData);
      setShowCreateModal(false);
      setFormData({ tagName: '', note: '' });
      await fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
    }
  };

  // Handle edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTag) return;
    
    try {
      const updateData: UpdateTagDto = {
        tagName: formData.tagName,
        note: formData.note
      };
      
      await tagService.updateTag(selectedTag.tagId, updateData);
      setShowEditModal(false);
      setSelectedTag(null);
      setFormData({ tagName: '', note: '' });
      await fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tag');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedTag) return;
    
    try {
      await tagService.deleteTag(selectedTag.tagId);
      setShowDeleteModal(false);
      setSelectedTag(null);
      await fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag');
    }
  };

  // Open edit modal
  const openEditModal = (tag: Tag) => {
    setSelectedTag(tag);
    setFormData({
      tagName: tag.tagName,
      note: tag.note || ''
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (tag: Tag) => {
    setSelectedTag(tag);
    setShowDeleteModal(true);
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
                  <h1 className="text-3xl font-bold text-gray-900">Tags Management</h1>
                  <p className="text-gray-600 mt-2">Manage news tags</p>
                </div>
                <Button 
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Tag
                </Button>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Search by tag name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
                <div className="pt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setSearchKeyword('')}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Tags List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Tags ({tags.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 h-24 rounded" />
                  ))}
                </div>
              ) : tags.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchKeyword ? 'No tags found matching your search' : 'No tags found'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tags.map((tag) => (
                    <div key={tag.tagId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          #{tag.tagName}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {/* Edit */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(tag)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          
                          {/* Delete */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal(tag)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      
                      {tag.note && (
                        <p className="text-gray-600 text-sm mb-2">{tag.note}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>ID: {tag.tagId}</span>
                        {tag.createdDate && (
                          <span>Created: {new Date(tag.createdDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      
                      {tag.newsArticles && (
                        <div className="mt-2">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {tag.newsArticles.length} articles
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Tag"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.tagName}
                onChange={(e) => setFormData(prev => ({ ...prev, tagName: e.target.value }))}
                placeholder="Enter tag name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Optional note about this tag"
              />
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
          title="Edit Tag"
        >
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.tagName}
                onChange={(e) => setFormData(prev => ({ ...prev, tagName: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              />
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
              Are you sure you want to delete "#{selectedTag?.tagName}"? This action cannot be undone.
            </p>
            {selectedTag?.newsArticles && selectedTag.newsArticles.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                Warning: This tag is used in {selectedTag.newsArticles.length} articles.
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