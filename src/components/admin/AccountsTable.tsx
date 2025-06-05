'use client';

import { AccountRole, SystemAccount } from '@/types/api';

interface AccountsTableProps {
  accounts: SystemAccount[];
  onEdit: (account: SystemAccount) => void;
  onDelete?: (account: SystemAccount) => void;
  onToggleStatus: (accountId: number) => void;
  onResetPassword: (accountId: number) => void;
  isLoading?: boolean;
  getRoleName: (role: AccountRole) => string;
}

export function AccountsTable({ 
  accounts, 
  onEdit, 
  onDelete,
  onToggleStatus,
  onResetPassword,
  isLoading = false,
  getRoleName
}: AccountsTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
        <div className="animate-pulse">
          <div className="bg-gray-50 h-16"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-gray-200 h-16 bg-gray-50"></div>
          ))}
        </div>
      </div>
    );
  }

  const getRoleColor = (role: AccountRole): string => {
    switch (role) {
      case AccountRole.Admin:
        return 'bg-red-100 text-red-800';
      case AccountRole.Staff:
        return 'bg-blue-100 text-blue-800';
      case AccountRole.Lecturer:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white @container">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-black w-[20%] text-sm font-semibold uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-black w-[25%] text-sm font-semibold uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-black w-[15%] text-sm font-semibold uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-4 text-left text-black w-[10%] text-sm font-semibold uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-black w-[15%] text-sm font-semibold uppercase tracking-wider">
              Created Date
            </th>
            <th className="px-6 py-4 text-left text-black w-[15%] text-sm font-semibold uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {accounts.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <span className="material-icons text-4xl text-gray-300 mb-2">people</span>
                  <p>No accounts found</p>
                </div>
              </td>
            </tr>
          ) : (
            accounts.map((account) => (
              <tr key={account.accountId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-black text-base font-medium">
                  <div className="max-w-xs truncate" title={account.accountName}>
                    {account.accountName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-base">
                  <div className="max-w-xs truncate" title={account.accountEmail}>
                    {account.accountEmail}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(account.accountRole)}`}>
                    {getRoleName(account.accountRole)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    account.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-base">
                  {account.createdDate ? new Date(account.createdDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onToggleStatus(account.accountId)}
                      className={`${
                        account.isActive 
                          ? 'text-orange-600 hover:text-orange-800' 
                          : 'text-green-600 hover:text-green-800'
                      } transition-colors`}
                      title={account.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <span className="material-icons">
                        {account.isActive ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                    <button
                      onClick={() => onEdit(account)}
                      className="text-black hover:text-gray-700 transition-colors"
                      title="Edit"
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button
                      onClick={() => onResetPassword(account.accountId)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Reset Password"
                    >
                      <span className="material-icons">lock_reset</span>
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(account)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Account"
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 