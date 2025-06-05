'use client';

import { useAuth } from '@/context/AuthContext';
import { accountService } from '@/lib/api-services';
import { AccountRole, ChangePasswordDto, SystemAccount, UpdateProfileDto } from '@/types/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<SystemAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState<UpdateProfileDto>({
    accountName: '',
    accountEmail: ''
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordDto>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password validation
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profileInfo = await accountService.getProfile();
      setProfile(profileInfo);
      setProfileData({
        accountName: profileInfo.accountName,
        accountEmail: profileInfo.accountEmail
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchProfile();
  }, [user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    try {
      setIsEditingProfile(true);
      setError(null);
      
             const updatedProfile = await accountService.updateProfile(profileData);
      setProfile(updatedProfile);
      setError(null);
      
      // Show success message (you could add a toast notification here)
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsEditingProfile(false);
    }
  };

  const validatePassword = (data: ChangePasswordDto): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.oldPassword) {
      errors.oldPassword = 'Current password is required';
    }
    
    if (!data.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (data.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validatePassword(passwordData);
    setPasswordErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    try {
      setIsChangingPassword(true);
      setError(null);
      
      await accountService.changePassword(passwordData);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      
      // Show success message
      alert('Password changed successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

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

  const roleDisplay = profile ? getRoleDisplay(profile.accountRole) : { name: 'Unknown', color: 'bg-gray-100 text-gray-800' };

  if (isLoading) {
    return (
      <div className="bg-slate-50" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
        <div className="animate-pulse px-10 md:px-20 lg:px-40 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
              <div className="px-8 py-10">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-8 bg-slate-200 rounded w-48"></div>
                    <div className="h-4 bg-slate-200 rounded w-64"></div>
                    <div className="flex gap-3">
                      <div className="h-6 bg-slate-200 rounded w-20"></div>
                      <div className="h-6 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-slate-200">
              <div className="border-b border-slate-200 px-8 py-4">
                <div className="flex space-x-8">
                  <div className="h-6 bg-slate-200 rounded w-32"></div>
                  <div className="h-6 bg-slate-200 rounded w-28"></div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-16"></div>
                      <div className="h-10 bg-slate-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-slate-50 flex items-center justify-center py-20" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
        <div className="text-center bg-white rounded-xl shadow-lg border border-slate-200 p-12 max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-slate-400 text-2xl">error_outline</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Profile Not Found</h2>
          <p className="text-slate-600 mb-6">Failed to load your profile information</p>
          <button 
            onClick={fetchProfile}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <div className="px-10 md:px-20 lg:px-40 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Breadcrumb */}
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-sm text-slate-600 mb-4">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-slate-900 font-medium">Profile</span>
            </nav>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
            <p className="text-slate-600 mt-2">Manage your account information and settings</p>
          </div>

          {/* Profile Header Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/30">
                  {profile.accountName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{profile.accountName}</h2>
                  <p className="text-blue-100 mt-1 text-lg">{profile.accountEmail}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      roleDisplay.color === 'bg-red-100 text-red-800' ? 'bg-red-500/20 text-red-100 border border-red-400/30' :
                      roleDisplay.color === 'bg-blue-100 text-blue-800' ? 'bg-blue-500/20 text-blue-100 border border-blue-400/30' :
                      'bg-green-500/20 text-green-100 border border-green-400/30'
                    }`}>
                      <span className="material-icons text-sm mr-1">
                        {profile.accountRole === AccountRole.Admin ? 'admin_panel_settings' : 
                         profile.accountRole === AccountRole.Staff ? 'work' : 'school'}
                      </span>
                      {roleDisplay.name}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                      profile.isActive 
                        ? 'bg-green-500/20 text-green-100 border-green-400/30' 
                        : 'bg-gray-500/20 text-gray-100 border-gray-400/30'
                    }`}>
                      <span className="material-icons text-sm mr-1">
                        {profile.isActive ? 'check_circle' : 'cancel'}
                      </span>
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-red-600 text-lg">error</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/50">
              <nav className="flex px-8">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600 bg-white -mb-px'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <span className="material-icons text-lg">person</span>
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'password'
                      ? 'border-blue-500 text-blue-600 bg-white -mb-px'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <span className="material-icons text-lg">lock</span>
                  Change Password
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-slate-900">Account Information</h3>
                    <Link 
                      href="/settings"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                    >
                      <span className="material-icons text-lg">settings</span>
                      Settings
                    </Link>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="accountName" className="block text-sm font-medium text-slate-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="accountName"
                          value={profileData.accountName}
                          onChange={(e) => setProfileData({ ...profileData, accountName: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="accountEmail" className="block text-sm font-medium text-slate-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="accountEmail"
                          value={profileData.accountEmail}
                          onChange={(e) => setProfileData({ ...profileData, accountEmail: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Role
                        </label>
                        <div className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-600">
                          {roleDisplay.name}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Account Status
                        </label>
                        <div className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-600">
                          {profile.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={isEditingProfile}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                      >
                        {isEditingProfile ? (
                          <>
                            <span className="animate-spin material-icons text-lg">refresh</span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <span className="material-icons text-lg">save</span>
                            Update Profile
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-slate-900">Change Password</h3>
                    <p className="text-slate-600 mt-1">Update your account password to keep your account secure</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <label htmlFor="oldPassword" className="block text-sm font-medium text-slate-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          passwordErrors.oldPassword ? 'border-red-300' : 'border-slate-300'
                        }`}
                        required
                      />
                      {passwordErrors.oldPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.oldPassword}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          passwordErrors.newPassword ? 'border-red-300' : 'border-slate-300'
                        }`}
                        required
                      />
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          passwordErrors.confirmPassword ? 'border-red-300' : 'border-slate-300'
                        }`}
                        required
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Password Requirements</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li className="flex items-center gap-2">
                          <span className="material-icons text-xs text-green-600">check</span>
                          At least 6 characters long
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-icons text-xs text-green-600">check</span>
                          Different from your current password
                        </li>
                      </ul>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                      >
                        {isChangingPassword ? (
                          <>
                            <span className="animate-spin material-icons text-lg">refresh</span>
                            Changing...
                          </>
                        ) : (
                          <>
                            <span className="material-icons text-lg">lock_reset</span>
                            Change Password
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordData({
                            oldPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                          setPasswordErrors({});
                        }}
                        className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 