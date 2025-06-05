'use client';

import { AccountRole, CreateSystemAccountDto, SystemAccount, UpdateSystemAccountDto } from '@/types/api';
import { useEffect, useState } from 'react';

interface AccountFormProps {
  account?: SystemAccount;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormData {
  accountName: string;
  accountEmail: string;
  accountPassword: string;
  accountRole: AccountRole;
  isActive: boolean;
}

interface FormErrors {
  accountName?: string;
  accountEmail?: string;
  accountPassword?: string;
  accountRole?: string;
}

export function AccountForm({ account, onSubmit, onCancel, isLoading = false }: AccountFormProps) {
  const [formData, setFormData] = useState<FormData>({
    accountName: '',
    accountEmail: '',
    accountPassword: '',
    accountRole: AccountRole.Staff,
    isActive: true
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (account) {
      setFormData({
        accountName: account.accountName,
        accountEmail: account.accountEmail,
        accountPassword: '', // Don't populate password for updates
        accountRole: account.accountRole,
        isActive: account.isActive
      });
    }
  }, [account]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    } else if (formData.accountName.length > 50) {
      newErrors.accountName = 'Account name must be 50 characters or less';
    }

    if (!formData.accountEmail.trim()) {
      newErrors.accountEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.accountEmail)) {
      newErrors.accountEmail = 'Please enter a valid email address';
    } else if (formData.accountEmail.length > 100) {
      newErrors.accountEmail = 'Email must be 100 characters or less';
    }

    // Password validation only for new accounts
    if (!account) {
      if (!formData.accountPassword.trim()) {
        newErrors.accountPassword = 'Password is required';
      } else if (formData.accountPassword.length < 6) {
        newErrors.accountPassword = 'Password must be at least 6 characters';
      }
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
      if (account) {
        // Update existing account
        const updateData: UpdateSystemAccountDto = {
          accountName: formData.accountName,
          accountEmail: formData.accountEmail,
          accountRole: formData.accountRole,
          isActive: formData.isActive
        };
        await onSubmit(updateData);
      } else {
        // Create new account
        const createData: CreateSystemAccountDto = {
          accountName: formData.accountName,
          accountEmail: formData.accountEmail,
          accountPassword: formData.accountPassword,
          accountRole: formData.accountRole
        };
        await onSubmit(createData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = field === 'isActive' 
      ? (e.target as HTMLInputElement).checked 
      : field === 'accountRole'
      ? parseInt(e.target.value) as AccountRole
      : e.target.value;
      
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getRoleName = (role: AccountRole): string => {
    switch (role) {
      case AccountRole.Admin:
        return 'Administrator';
      case AccountRole.Staff:
        return 'Staff';
      case AccountRole.Lecturer:
        return 'Lecturer';
      default:
        return 'Staff';
    }
  };

  const getRoleDescription = (role: AccountRole): string => {
    switch (role) {
      case AccountRole.Admin:
        return 'Full system access and management privileges';
      case AccountRole.Staff:
        return 'Manage news articles and moderate content';
      case AccountRole.Lecturer:
        return 'Create and edit own news articles';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Name */}
      <div>
        <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
          Account Name *
        </label>
        <input
          type="text"
          id="accountName"
          value={formData.accountName}
          onChange={handleInputChange('accountName')}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.accountName ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter account name"
          disabled={isLoading}
          required
        />
        {errors.accountName && (
          <p className="mt-1 text-sm text-red-600">{errors.accountName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="accountEmail" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          id="accountEmail"
          value={formData.accountEmail}
          onChange={handleInputChange('accountEmail')}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.accountEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter email address"
          disabled={isLoading}
          required
        />
        {errors.accountEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.accountEmail}</p>
        )}
      </div>

      {/* Password (only for new accounts) */}
      {!account && (
        <div>
          <label htmlFor="accountPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            type="password"
            id="accountPassword"
            value={formData.accountPassword}
            onChange={handleInputChange('accountPassword')}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.accountPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter password"
            disabled={isLoading}
            required
          />
          {errors.accountPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.accountPassword}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Password must be at least 6 characters long
          </p>
        </div>
      )}

      {/* Account Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Role *
        </label>
        <div className="space-y-3">
          {Object.values(AccountRole).filter(role => typeof role === 'number').map((role) => (
            <label
              key={role}
              className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="accountRole"
                value={role}
                checked={formData.accountRole === role}
                onChange={handleInputChange('accountRole')}
                className="mt-1 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <div>
                <div className="font-medium text-gray-900">
                  {getRoleName(role as AccountRole)}
                </div>
                <div className="text-sm text-gray-500">
                  {getRoleDescription(role as AccountRole)}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Active Status (only for updates) */}
      {account && (
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={handleInputChange('isActive')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-gray-700">Active Account</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Inactive accounts cannot log in to the system
          </p>
        </div>
      )}

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
          {account ? 'Update Account' : 'Create Account'}
        </button>
      </div>
    </form>
  );
}

export default AccountForm; 