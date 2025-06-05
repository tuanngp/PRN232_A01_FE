'use client';

import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { accountService } from '@/lib/api-services';
import { AccountRole, SystemAccount, UpdateSystemAccountDto } from '@/types/api';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = Number(params.id);

  const [account, setAccount] = useState<SystemAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateSystemAccountDto>({
    accountName: '',
    accountEmail: '',
    accountRole: AccountRole.Staff,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, [accountId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch account data
      const accountData = await accountService.getAccountById(accountId);
      setAccount(accountData);

      // Set form data from account
      setFormData({
        accountName: accountData.accountName,
        accountEmail: accountData.accountEmail,
        accountRole: accountData.accountRole,
        isActive: accountData.isActive
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load account data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.accountName?.trim()) {
      setError('Account name is required.');
      return false;
    }

    if (formData.accountName.length > 100) {
      setError('Account name must be 100 characters or less.');
      return false;
    }

    if (!formData.accountEmail?.trim()) {
      setError('Email is required.');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.accountEmail)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (formData.accountEmail.length > 255) {
      setError('Email must be 255 characters or less.');
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

      // Update the account
      await accountService.updateAccount(accountId, formData);

      router.push('/admin/accounts');
    } catch (error) {
      console.error('Failed to update account:', error);
      setError('Failed to update account. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/accounts');
  };

  const getRoleName = (role: AccountRole): string => {
    switch (role) {
      case AccountRole.Admin:
        return 'Admin';
      case AccountRole.Staff:
        return 'Staff';
      case AccountRole.Lecturer:
        return 'Lecturer';
      default:
        return 'Unknown';
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

  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  if (!account) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="text-center py-12">
            <span className="material-icons text-6xl text-gray-300 mb-4">person</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Not Found</h2>
            <p className="text-gray-600 mb-6">The account you're looking for doesn't exist.</p>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Accounts
            </button>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
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
            <h1 className="text-black text-4xl font-bold leading-tight">Edit Account</h1>
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
            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.accountName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                placeholder="Enter full name..."
                maxLength={100}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.accountEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, accountEmail: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                placeholder="Enter email address..."
                maxLength={255}
              />
            </div>

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
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        accountRole: Number(e.target.value) as AccountRole 
                      }))}
                      className="mt-1 text-black focus:ring-black"
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

            {/* Active Status */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active Account
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Inactive accounts cannot log in to the system
              </p>
            </div>

            {/* Account Info */}
            {account.createdDate && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Account Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Account ID: {account.accountId}</p>
                  <p>Created: {new Date(account.createdDate).toLocaleDateString()}</p>
                  {account.modifiedDate && (
                    <p>Last Modified: {new Date(account.modifiedDate).toLocaleDateString()}</p>
                  )}
                  {account.createdNewsArticles && (
                    <p>Articles Created: {account.createdNewsArticles.length}</p>
                  )}
                </div>
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
                    Update Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}