'use client';

import { StaffRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { categoryService, newsArticleTagService, newsService, tagService } from '@/lib/api-services';
import { Category, NewsArticle, Tag, UpdateNewsArticleDto } from '@/types/api';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = Number(params.id);

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateNewsArticleDto>({
    newsTitle: '',
    headline: '',
    newsContent: '',
    newsSource: '',
    categoryId: 0
  });

  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, [newsId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch article, categories, and tags in parallel
      const [articleData, categoriesData, tagsData] = await Promise.all([
        newsService.getNewsById(newsId),
        categoryService.getAllCategories(),
        tagService.getAllTags()
      ]);

      setArticle(articleData);
      setCategories(categoriesData);
      setAllTags(tagsData);

      // Set form data from article
      setFormData({
        newsTitle: articleData.newsTitle,
        headline: articleData.headline || '',
        newsContent: articleData.newsContent,
        newsSource: articleData.newsSource || '',
        categoryId: articleData.categoryId
      });

      // Set selected tags
      if (articleData.tags) {
        setSelectedTags(articleData.tags.map(tag => tag.tagId));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load article data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newsTitle?.trim() || !formData.newsContent?.trim() || !formData.categoryId) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update the article
      await newsService.updateNews(newsId, formData);

      // Update tags if they changed
      if (article?.tags) {
        const currentTagIds = article.tags.map(tag => tag.tagId);
        if (JSON.stringify(currentTagIds.sort()) !== JSON.stringify(selectedTags.sort())) {
          await newsArticleTagService.replaceArticleTags(newsId, { tagIds: selectedTags });
        }
      }

      router.push('/admin/news');
    } catch (error) {
      console.error('Failed to update article:', error);
      setError('Failed to update article. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/news');
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
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
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </div>
        </AdminLayout>
      </StaffRoute>
    );
  }

  if (!article) {
    return (
      <StaffRoute>
        <AdminLayout>
          <div className="text-center py-12">
            <span className="material-icons text-6xl text-gray-300 mb-4">article</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Articles
            </button>
          </div>
        </AdminLayout>
      </StaffRoute>
    );
  }

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
            <h1 className="text-black text-4xl font-bold leading-tight">Edit Article</h1>
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

            {/* Category and Source Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {allTags.map(tag => (
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
                    Update Article
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