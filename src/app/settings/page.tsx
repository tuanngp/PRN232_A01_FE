'use client';

import { useAuth } from '@/context/AuthContext';
import { accountService } from '@/lib/api-services';
import { ChangePasswordDto } from '@/types/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'account' | 'security' | 'preferences'>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password form state
  const [passwordData, setPasswordData] = useState<ChangePasswordDto>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'light',
    emailNotifications: true,
    pushNotifications: false,
    newsDigest: true,
    marketingEmails: false
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
  }, [user, router]);

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
      setSuccessMessage(null);
      
      await accountService.changePassword(passwordData);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      setSuccessMessage('Password changed successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Here you would normally save preferences to the backend
      // For now, we'll just show a success message
      setSuccessMessage('Preferences updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strength = {
      0: { label: '', color: '' },
      1: { label: 'Very Weak', color: 'text-red-600' },
      2: { label: 'Weak', color: 'text-orange-600' },
      3: { label: 'Fair', color: 'text-yellow-600' },
      4: { label: 'Good', color: 'text-blue-600' },
      5: { label: 'Strong', color: 'text-green-600' }
    };
    
    return { score, ...strength[score as keyof typeof strength] };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <div className="bg-slate-50" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <div className="px-10 md:px-20 lg:px-40 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Breadcrumb */}
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-sm text-slate-600 mb-4">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <span className="material-icons text-xs">chevron_right</span>
              <Link href="/profile" className="hover:text-blue-600 transition-colors">Profile</Link>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-slate-900 font-medium">Settings</span>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
                <p className="text-slate-600 mt-2">Manage your account preferences and security settings</p>
              </div>
              <Link 
                href="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <span className="material-icons text-lg">person</span>
                Back to Profile
              </Link>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-green-600 text-lg">check_circle</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-green-800 font-medium">Success</h3>
                  <p className="text-green-700 mt-1">{successMessage}</p>
                </div>
                <button 
                  onClick={() => setSuccessMessage(null)}
                  className="ml-auto text-green-600 hover:text-green-700"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>
          )}

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
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-700"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64">
              <nav className="bg-white rounded-xl shadow-lg border border-slate-200 p-2">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveSection('account')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      activeSection === 'account'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-icons text-lg">
                      {activeSection === 'account' ? 'account_circle' : 'account_circle'}
                    </span>
                    Account Information
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('security')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      activeSection === 'security'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-icons text-lg">
                      {activeSection === 'security' ? 'security' : 'security'}
                    </span>
                    Security
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('preferences')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      activeSection === 'preferences'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-icons text-lg">
                      {activeSection === 'preferences' ? 'tune' : 'tune'}
                    </span>
                    Preferences
                  </button>
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200">
                {/* Account Information */}
                {activeSection === 'account' && (
                  <div className="p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Information</h2>
                      <p className="text-slate-600">View and manage your basic account details</p>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-50 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                            {user?.accountName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900">{user?.accountName || 'User'}</h3>
                            <p className="text-slate-600">{user?.accountEmail || 'user@example.com'}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Account ID</label>
                            <div className="px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-600">
                              #{user?.accountId || 'N/A'}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                            <div className="px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-600">
                              {user?.accountRole === 0 ? 'Administrator' : 
                               user?.accountRole === 1 ? 'Staff' : 
                               user?.accountRole === 2 ? 'Lecturer' : 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <div>
                          <p className="text-sm text-slate-600">
                            To update your personal information, go to your profile page.
                          </p>
                        </div>
                        <Link 
                          href="/profile"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          <span className="material-icons text-lg">edit</span>
                          Edit Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeSection === 'security' && (
                  <div className="p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">Security Settings</h2>
                      <p className="text-slate-600">Manage your password and account security</p>
                    </div>

                    <div className="space-y-8">
                      {/* Change Password */}
                      <div className="bg-slate-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h3>
                        
                        <form onSubmit={handleChangePassword} className="space-y-6">
                          <div>
                            <label htmlFor="oldPassword" className="block text-sm font-medium text-slate-700 mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={showOldPassword ? 'text' : 'password'}
                                id="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                  passwordErrors.oldPassword ? 'border-red-300' : 'border-slate-300'
                                }`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                <span className="material-icons">
                                  {showOldPassword ? 'visibility_off' : 'visibility'}
                                </span>
                              </button>
                            </div>
                            {passwordErrors.oldPassword && (
                              <p className="mt-1 text-sm text-red-600">{passwordErrors.oldPassword}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                id="newPassword"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                  passwordErrors.newPassword ? 'border-red-300' : 'border-slate-300'
                                }`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                <span className="material-icons">
                                  {showNewPassword ? 'visibility_off' : 'visibility'}
                                </span>
                              </button>
                            </div>
                            {passwordData.newPassword && (
                              <div className="mt-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-300 ${
                                        passwordStrength.score === 0 ? 'w-0' :
                                        passwordStrength.score === 1 ? 'w-1/5 bg-red-500' :
                                        passwordStrength.score === 2 ? 'w-2/5 bg-orange-500' :
                                        passwordStrength.score === 3 ? 'w-3/5 bg-yellow-500' :
                                        passwordStrength.score === 4 ? 'w-4/5 bg-blue-500' :
                                        'w-full bg-green-500'
                                      }`}
                                    ></div>
                                  </div>
                                  {passwordStrength.label && (
                                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                                      {passwordStrength.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            {passwordErrors.newPassword && (
                              <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                  passwordErrors.confirmPassword ? 'border-red-300' : 'border-slate-300'
                                }`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                <span className="material-icons">
                                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                </span>
                              </button>
                            </div>
                            {passwordErrors.confirmPassword && (
                              <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                            )}
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <h4 className="text-sm font-medium text-slate-700 mb-3">Password Requirements</h4>
                            <ul className="text-sm text-slate-600 space-y-1">
                              <li className="flex items-center gap-2">
                                <span className={`material-icons text-xs ${passwordData.newPassword.length >= 6 ? 'text-green-600' : 'text-slate-400'}`}>
                                  {passwordData.newPassword.length >= 6 ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                                At least 6 characters long
                              </li>
                              <li className="flex items-center gap-2">
                                <span className={`material-icons text-xs ${passwordData.newPassword !== passwordData.oldPassword && passwordData.newPassword ? 'text-green-600' : 'text-slate-400'}`}>
                                  {passwordData.newPassword !== passwordData.oldPassword && passwordData.newPassword ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
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
                                  Update Password
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
                    </div>
                  </div>
                )}

                {/* Preferences */}
                {activeSection === 'preferences' && (
                  <div className="p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">Preferences</h2>
                      <p className="text-slate-600">Customize your experience and notification settings</p>
                    </div>

                    <div className="space-y-8">
                      {/* Language & Theme */}
                      <div className="bg-slate-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Language & Theme</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                            <select
                              value={preferences.language}
                              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value="en">English</option>
                              <option value="vi">Tiếng Việt</option>
                              <option value="fr">Français</option>
                              <option value="es">Español</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
                            <select
                              value={preferences.theme}
                              onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                              <option value="system">System</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Notifications */}
                      <div className="bg-slate-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Notifications</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-slate-900">Email Notifications</h4>
                              <p className="text-sm text-slate-600">Receive notifications via email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences.emailNotifications}
                                onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-slate-900">Push Notifications</h4>
                              <p className="text-sm text-slate-600">Receive push notifications in your browser</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences.pushNotifications}
                                onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-slate-900">News Digest</h4>
                              <p className="text-sm text-slate-600">Weekly summary of latest news</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences.newsDigest}
                                onChange={(e) => setPreferences({ ...preferences, newsDigest: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-slate-900">Marketing Emails</h4>
                              <p className="text-sm text-slate-600">Promotional emails and updates</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences.marketingEmails}
                                onChange={(e) => setPreferences({ ...preferences, marketingEmails: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={handlePreferencesUpdate}
                          disabled={isLoading}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <span className="animate-spin material-icons text-lg">refresh</span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <span className="material-icons text-lg">save</span>
                              Save Preferences
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 