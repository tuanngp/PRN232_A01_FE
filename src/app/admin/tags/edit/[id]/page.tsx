'use client';

import { StaffRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { tagService } from '@/lib/api-services';
import { Tag, UpdateTagDto } from '@/types/api';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const tagId = Number(params.id);

  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateTagDto>({
    tagName: '',
    note: ''
  });

  useEffect(() => {
    fetchData();
  }, [tagId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tag data
      const tagData = await tagService.getTagById(tagId);
      setTag(tagData);

      // Set form data from tag
      setFormData({
        tagName: tagData.tagName,
        note: tagData.note || ''
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load tag data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.tagName?.trim()) {
      setError('Tag name is required.');
      return false;
    }

    if (formData.tagName.length > 50) {
      setError('Tag name must be 50 characters or less.');
      return false;
    }

    if (formData.note && formData.note.length > 200) {
      setError('Note must be 200 characters or less.');
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

      // Update the tag
      await tagService.updateTag(tagId, formData);

      router.push('/admin/tags');
    } catch (error) {
      console.error('Failed to update tag:', error);
      setError('Failed to update tag. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/tags');
  };

  if (loading) {
    return (
      <StaffRoute>
        <AdminLayout>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </AdminLayout>
      </StaffRoute>
    );
  }

  if (!tag) {
    return (
      <StaffRoute>
        <AdminLayout>
          <div className="text-center py-12">
            <span className="material-icons text-6xl text-gray-300 mb-4">label</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tag Not Found</h2>
            <p className="text-gray-600 mb-6">The tag you're looking for doesn't exist.</p>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Tags
            </button>
          </div>
        </AdminLayout>
      </StaffRoute>
    );
  }

  return (
    <StaffRoute>
      <AdminLayout>
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <h1 className="text-black text-4xl font-bold leading-tight">Edit Tag</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="material-icons text-red-500 mr-2">error</span>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tag Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag Name *
              </label>
              <input
                type="text"
                required
                value={formData.tagName}
                onChange={(e) => setFormData(prev => ({ ...prev, tagName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                placeholder="Enter tag name..."
                maxLength={50}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.tagName?.length || 0}/50 characters
              </p>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                rows={4}
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 resize-none"
                placeholder="Enter note about this tag..."
                maxLength={200}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.note?.length || 0}/200 characters
              </p>
            </div>

            {/* Tag Info */}
            {tag.newsArticles && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tag Statistics</h3>
                <p className="text-sm text-gray-600">
                  This tag is used in {tag.newsArticles.length} article(s)
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="material-icons animate-spin">sync</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="material-icons">save</span>
                    Update Tag
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </StaffRoute>
  );
}