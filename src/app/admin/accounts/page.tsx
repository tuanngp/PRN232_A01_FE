'use client';

import { AccountForm, StatisticsReport } from '@/components/admin';
import { AccountsTable } from '@/components/admin/AccountsTable';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ConfirmDialog, Modal } from '@/components/ui';
import { accountService } from '@/lib/api-services';
import { AccountRole, CreateSystemAccountDto, SystemAccount, UpdateSystemAccountDto } from '@/types/api';
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

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SystemAccount | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use OData query to get active accounts only (exclude inactive ones)
      const query = '$filter=IsActive eq true&$orderby=CreatedDate desc';
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
    if (!searchTerm.trim() && !filterRole && filterStatus === '') {
      fetchAccounts();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const filters: string[] = ['IsActive eq true']; // Only show active accounts
      
      if (searchTerm.trim()) {
        filters.push(`(contains(tolower(AccountName), '${searchTerm.toLowerCase()}') or contains(tolower(AccountEmail), '${searchTerm.toLowerCase()}'))`);
      }
      
      if (filterRole !== '') {
        filters.push(`AccountRole eq ${filterRole}`);
      }
      
      if (filterStatus !== '') {
        filters.push(`IsActive eq ${filterStatus}`);
      }
      
      const query = `$filter=${filters.join(' and ')}&$orderby=CreatedDate desc`;
      const data = await accountService.getAccountsOData(query);
      setAccounts(data);
    } catch (error) {
      console.error('Search/filter failed:', error);
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

  const handleCreateNew = () => {
    setSelectedAccount(null);
    setShowCreateModal(true);
  };

  const handleEdit = (account: SystemAccount) => {
    setSelectedAccount(account);
    setShowEditModal(true);
  };

  const handleDelete = (account: SystemAccount) => {
    setSelectedAccount(account);
    setShowDeleteConfirm(true);
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

  const handleCreateSubmit = async (data: CreateSystemAccountDto) => {
    try {
      setFormLoading(true);
      await accountService.createAccount(data);
      setShowCreateModal(false);
      await fetchAccounts();
    } catch (error) {
      console.error('Create account failed:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (data: UpdateSystemAccountDto) => {
    if (!selectedAccount) return;
    
    try {
      setFormLoading(true);
      await accountService.updateAccount(selectedAccount.accountId, data);
      setShowEditModal(false);
      setSelectedAccount(null);
      await fetchAccounts();
    } catch (error) {
      console.error('Update account failed:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAccount) return;

    try {
      setDeleteLoading(true);
      // Import trashService
      const { trashService } = await import('@/lib/api-services');
      await trashService.softDeleteAccount(selectedAccount.accountId);
      setShowDeleteConfirm(false);
      setSelectedAccount(null);
      await fetchAccounts();
    } catch (error) {
      console.error('Delete account failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to move account to trash. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
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

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteConfirm(false);
    setShowStatisticsModal(false);
    setSelectedAccount(null);
  };

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <p className="text-black text-4xl font-bold leading-tight">Account Management</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowStatisticsModal(true)}
              className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-full h-10 px-6 bg-green-600 text-white text-base font-medium leading-normal shadow-md hover:bg-green-700 transition-colors"
            >
              <span className="material-icons">analytics</span>
              <span className="truncate">Statistics</span>
            </button>
            <button 
              onClick={handleCreateNew}
              className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-full h-10 px-6 bg-black text-white text-base font-medium leading-normal shadow-md hover:bg-gray-800 transition-colors"
            >
              <span className="material-icons">add_circle</span>
              <span className="truncate">New Account</span>
            </button>
          </div>
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
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword}
          isLoading={loading}
          getRoleName={getRoleName}
        />

        {/* Create Account Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={closeModals}
          title="Create New Account"
          size="lg"
        >
          <AccountForm
            onSubmit={handleCreateSubmit}
            onCancel={closeModals}
            isLoading={formLoading}
          />
        </Modal>

        {/* Edit Account Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={closeModals}
          title="Edit Account"
          size="lg"
        >
          <AccountForm
            account={selectedAccount || undefined}
            onSubmit={handleEditSubmit}
            onCancel={closeModals}
            isLoading={formLoading}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={closeModals}
          onConfirm={handleDeleteConfirm}
          title="Move to Trash"
          message={
            <div>
              <p className="mb-2">
                Are you sure you want to move the account <strong>{selectedAccount?.accountName}</strong> to trash?
              </p>
              <p className="text-sm text-gray-600">
                The account will be deactivated and moved to trash. It can be restored later.
              </p>
            </div>
          }
          confirmText="Move to Trash"
          type="danger"
          isLoading={deleteLoading}
        />

        {/* Statistics Modal */}
        <Modal
          isOpen={showStatisticsModal}
          onClose={closeModals}
          title="Statistics Report"
          size="xl"
        >
          <StatisticsReport onClose={closeModals} />
        </Modal>
      </AdminLayout>
    </AdminRoute>
  );
} 