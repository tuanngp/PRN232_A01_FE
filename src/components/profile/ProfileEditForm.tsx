'use client';

import { UpdateProfileDto } from '@/types/api';
import { useState } from 'react';

interface ProfileEditFormProps {
  initialData: UpdateProfileDto;
  onSubmit: (data: UpdateProfileDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProfileEditForm({ initialData, onSubmit, onCancel, isLoading = false }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<UpdateProfileDto>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountName?.trim()) {
      newErrors.accountName = 'Name is required';
    } else if (formData.accountName.length > 50) {
      newErrors.accountName = 'Name must be 50 characters or less';
    }

    if (!formData.accountEmail?.trim()) {
      newErrors.accountEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.accountEmail)) {
      newErrors.accountEmail = 'Please enter a valid email address';
    } else if (formData.accountEmail.length > 100) {
      newErrors.accountEmail = 'Email must be 100 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleInputChange = (field: keyof UpdateProfileDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="accountName"
            value={formData.accountName || ''}
            onChange={(e) => handleInputChange('accountName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.accountName ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
            maxLength={50}
            required
          />
          {errors.accountName && (
            <p className="mt-1 text-sm text-red-600">{errors.accountName}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="accountEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="accountEmail"
            value={formData.accountEmail || ''}
            onChange={(e) => handleInputChange('accountEmail', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.accountEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
            maxLength={100}
            required
          />
          {errors.accountEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.accountEmail}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
} 