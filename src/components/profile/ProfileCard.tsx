'use client';

import { AccountRole, SystemAccount } from '@/types/api';

interface ProfileCardProps {
  profile: SystemAccount;
  onEdit?: () => void;
  showEditButton?: boolean;
}

export function ProfileCard({ profile, onEdit, showEditButton = false }: ProfileCardProps) {
  const getRoleDisplay = (role: AccountRole) => {
    switch (role) {
      case AccountRole.Admin:
        return { name: 'Administrator', color: 'bg-red-100 text-red-800' };
      case AccountRole.Staff:
        return { name: 'Staff', color: 'bg-blue-100 text-blue-800' };
      case AccountRole.Lecturer:
        return { name: 'Lecturer', color: 'bg-green-100 text-green-800' };
      default:
        return { name: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const roleDisplay = getRoleDisplay(profile.accountRole);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-8">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
            {profile.accountName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{profile.accountName}</h1>
            <p className="text-gray-600 mt-1">{profile.accountEmail}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleDisplay.color}`}>
                {roleDisplay.name}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                profile.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          {showEditButton && onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="material-icons text-sm">edit</span>
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 