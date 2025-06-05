'use client';

import { StaffRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { categoryService, newsArticleTagService, newsService, tagService } from '@/lib/api-services';
import { Category, CreateNewsArticleDto, NewsArticleRequest, NewsStatus, Tag } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CreateNewsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewsArticleRequest>({
    newsTitle: '',
    headline: '',
    newsContent: '',
    newsSource: '',
    categoryId: 0,
    newsStatus: NewsStatus.Inactive
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          categoryService.getActiveCategories(),
          tagService.getAllTags()
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (err) {
        setError('Failed to load initial data');
      }
    };

    fetchInitialData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create the news article
      const createData: CreateNewsArticleDto = {
        newsTitle: formData.newsTitle,
        headline: formData.headline,
        newsContent: formData.newsContent,
        newsSource: formData.newsSource,
        categoryId: formData.categoryId
      };
      
      const newArticle = await newsService.createNews(createData);
      
      // Set status if different from default
      if (formData.newsStatus === NewsStatus.Active) {
        await newsService.changeNewsStatus(newArticle.newsArticleId, { status: NewsStatus.Active });
      }
      
      // Add tags if selected
      if (selectedTags.length > 0) {
        await newsArticleTagService.addMultipleTagsToArticle(newArticle.newsArticleId, { tagIds: selectedTags });
      }
      
      // Redirect to news management page
      router.push('/admin/news');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create news article');
    } finally {
      setLoading(false);
    }
  };

  // Handle tag selection
  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCancel = () => {
    router.push('/admin/news');
  };

  return (
    <StaffRoute>
      <AdminLayout>
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <h1 className="text-black text-4xl font-bold leading-tight">Create New Article</h1>
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
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.newsTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, newsTitle: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                placeholder="Enter article title..."
              />
            </div>

            {/* Headline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Headline
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                placeholder="Enter article headline..."
              />
            </div>

            {/* Category, Status, and Source Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                >
                  <option value={0}>Select a category</option>
                  {categories.map(category => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  required
                  value={formData.newsStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, newsStatus: Number(e.target.value) as NewsStatus }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                >
                  <option value={NewsStatus.Inactive}>Inactive</option>
                  <option value={NewsStatus.Active}>Active</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <input
                  type="text"
                  value={formData.newsSource}
                  onChange={(e) => setFormData(prev => ({ ...prev, newsSource: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                  placeholder="Enter news source..."
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                required
                rows={12}
                value={formData.newsContent}
                onChange={(e) => setFormData(prev => ({ ...prev, newsContent: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 resize-none"
                placeholder="Write your article content here..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {tags.map(tag => (
                    <label
                      key={tag.tagId}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.tagId)}
                        onChange={() => handleTagToggle(tag.tagId)}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-700">{tag.tagName}</span>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {selectedTags.length} tags
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="material-icons animate-spin">sync</span>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="material-icons">add_circle</span>
                    Create Article
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