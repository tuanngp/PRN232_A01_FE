'use client';

import { CreateTagDto, Tag, UpdateTagDto } from '@/types/api';
import { useEffect, useState } from 'react';

interface TagFormProps {
  tag?: Tag;
  onSubmit: (data: CreateTagDto | UpdateTagDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormData {
  tagName: string;
  note: string;
}

interface FormErrors {
  tagName?: string;
  note?: string;
}

export function TagForm({ tag, onSubmit, onCancel, isLoading = false }: TagFormProps) {
  const [formData, setFormData] = useState<FormData>({
    tagName: '',
    note: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (tag) {
      setFormData({
        tagName: tag.tagName,
        note: tag.note || ''
      });
    }
  }, [tag]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.tagName.trim()) {
      newErrors.tagName = 'Tag name is required';
    } else if (formData.tagName.length > 50) {
      newErrors.tagName = 'Tag name must be 50 characters or less';
    }

    if (formData.note && formData.note.length > 200) {
      newErrors.note = 'Note must be 200 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (tag) {
        // Update existing tag
        const updateData: UpdateTagDto = {
          tagName: formData.tagName,
          note: formData.note || undefined
        };
        await onSubmit(updateData);
      } else {
        // Create new tag
        const createData: CreateTagDto = {
          tagName: formData.tagName,
          note: formData.note || undefined
        };
        await onSubmit(createData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
      
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tag Name */}
      <div>
        <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 mb-2">
          Tag Name *
        </label>
        <input
          type="text"
          id="tagName"
          value={formData.tagName}
          onChange={handleInputChange('tagName')}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.tagName ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter tag name"
          disabled={isLoading}
          required
        />
        {errors.tagName && (
          <p className="mt-1 text-sm text-red-600">{errors.tagName}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Maximum 50 characters
        </p>
      </div>

      {/* Note */}
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
          Note
        </label>
        <textarea
          id="note"
          value={formData.note}
          onChange={handleInputChange('note')}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.note ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter note (optional)"
          disabled={isLoading}
        />
        {errors.note && (
          <p className="mt-1 text-sm text-red-600">{errors.note}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Maximum 200 characters
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading && (
            <span className="material-icons animate-spin text-sm mr-2">refresh</span>
          )}
          {tag ? 'Update Tag' : 'Create Tag'}
        </button>
      </div>
    </form>
  );
}

export default TagForm; 