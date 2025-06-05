'use client';

import { AccountsTable } from '@/components/admin/AccountsTable';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { accountService } from '@/lib/api-services';
import { AccountRole, SystemAccount } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<SystemAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<AccountRole | ''>('');
  const [filterStatus, setFilterStatus] = useState<boolean | ''>('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use OData query to get accounts with related data
      const query = '$orderby=AccountName asc';
      const data = await accountService.getAccountsOData(query);
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      setError('Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = '';
      const filters: string[] = [];
      
      // Add search filter
      if (searchTerm.trim()) {
        filters.push(`contains(tolower(AccountName), '${searchTerm.toLowerCase()}') or contains(tolower(AccountEmail), '${searchTerm.toLowerCase()}')`);
      }
      
      // Add role filter
      if (filterRole !== '') {
        filters.push(`AccountRole eq ${filterRole}`);
      }
      
      // Add status filter
      if (filterStatus !== '') {
        filters.push(`IsActive eq ${filterStatus}`);
      }
      
      // Build query
      if (filters.length > 0) {
        query = `$filter=${filters.join(' and ')}&$orderby=AccountName asc`;
      } else {
        query = '$orderby=AccountName asc';
      }
      
      const data = await accountService.getAccountsOData(query);
      setAccounts(data);
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRole('');
    setFilterStatus('');
    fetchAccounts();
  };

  const handleEdit = (account: SystemAccount) => {
    router.push(`/admin/accounts/edit/${account.accountId}`);
  };

  const handleToggleStatus = async (accountId: number) => {
    try {
      await accountService.toggleAccountStatus(accountId);
      await fetchAccounts(); // Refresh the list
    } catch (error) {
      console.error('Toggle status failed:', error);
      alert('Failed to update account status. Please try again.');
    }
  };

  const handleResetPassword = async (accountId: number) => {
    if (!confirm('Are you sure you want to reset this account\'s password? A temporary password will be generated.')) {
      return;
    }

    try {
      // Generate a temporary password
      const tempPassword = 'TempPass123!';
      await accountService.resetPassword(accountId, { newPassword: tempPassword });
      alert(`Password reset successfully. Temporary password: ${tempPassword}`);
    } catch (error) {
      console.error('Reset password failed:', error);
      alert('Failed to reset password. Please try again.');
    }
  };

  const handleCreateNew = () => {
    router.push('/admin/accounts/create');
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

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <p className="text-black text-4xl font-bold leading-tight">Accounts</p>
          <button 
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-full h-10 px-6 bg-black text-white text-base font-medium leading-normal shadow-md hover:bg-gray-800 transition-colors"
          >
            <span className="material-icons">add_circle</span>
            <span className="truncate">New Account</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-full h-full shadow-sm">
              <div className="text-gray-500 flex bg-gray-100 items-center justify-center pl-4 rounded-l-full border border-gray-200 border-r-0">
                <span className="material-icons">search</span>
              </div>
              <input 
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-black focus:outline-0 focus:ring-2 focus:ring-black focus:ring-opacity-50 border border-gray-200 bg-gray-100 focus:border-gray-200 h-full placeholder:text-gray-500 px-4 text-base font-normal leading-normal" 
                placeholder="Search accounts by name or email..."
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

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Role:</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as AccountRole | '')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
              >
                <option value="">All Roles</option>
                <option value={AccountRole.Admin}>Admin</option>
                <option value={AccountRole.Staff}>Staff</option>
                <option value={AccountRole.Lecturer}>Lecturer</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filterStatus.toString()}
                onChange={(e) => setFilterStatus(e.target.value === '' ? '' : e.target.value === 'true')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons text-red-500 mr-2">error</span>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchAccounts}
                className="ml-auto text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <AccountsTable
          accounts={accounts}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword}
          isLoading={loading}
          getRoleName={getRoleName}
        />
      </AdminLayout>
    </AdminRoute>
  );
} 