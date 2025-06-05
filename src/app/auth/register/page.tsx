'use client';

import { ApiError } from '@/lib/api';
import { accountService } from '@/lib/api-services';
import { AccountRole, CreateSystemAccountDto } from '@/types/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface RegisterForm {
  accountName: string;
  accountEmail: string;
  accountPassword: string;
  confirmPassword: string;
  accountRole: AccountRole;
  agreeToTerms: boolean;
}

interface FormErrors {
  accountName?: string;
  accountEmail?: string;
  accountPassword?: string;
  confirmPassword?: string;
  accountRole?: string;
  agreeToTerms?: string;
  general?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  
  const [form, setForm] = useState<RegisterForm>({
    accountName: '',
    accountEmail: '',
    accountPassword: '',
    confirmPassword: '',
    accountRole: AccountRole.Lecturer,
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!form.accountName.trim()) {
      newErrors.accountName = 'Full name is required';
    } else if (form.accountName.trim().length < 2) {
      newErrors.accountName = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!form.accountEmail.trim()) {
      newErrors.accountEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.accountEmail)) {
      newErrors.accountEmail = 'Please enter a valid email';
    }

    // Password validation
    if (!form.accountPassword) {
      newErrors.accountPassword = 'Password is required';
    } else if (form.accountPassword.length < 8) {
      newErrors.accountPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.accountPassword)) {
      newErrors.accountPassword = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.accountPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!form.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrors({});
      
      const registerData: CreateSystemAccountDto = {
        accountName: form.accountName.trim(),
        accountEmail: form.accountEmail.trim().toLowerCase(),
        accountPassword: form.accountPassword,
        accountRole: form.accountRole
      };

      await accountService.createAccount(registerData);
      
      // Show success message and redirect to login
      alert('Account created successfully! Please login with your credentials.');
      router.push('/auth/login');
      
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error instanceof ApiError) {
        switch (error.status) {
          case 400:
            errorMessage = 'Invalid registration data. Please check your inputs.';
            break;
          case 409:
            errorMessage = 'An account with this email already exists.';
            break;
          case 422:
            errorMessage = 'Validation error. Please check your inputs.';
            break;
          default:
            errorMessage = error.message || 'Registration failed';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof RegisterForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = field === 'agreeToTerms' 
      ? (e.target as HTMLInputElement).checked 
      : field === 'accountRole'
      ? parseInt(e.target.value) as AccountRole
      : e.target.value;
      
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getRoleDisplayName = (role: AccountRole): string => {
    switch (role) {
      case AccountRole.Admin:
        return 'Administrator';
      case AccountRole.Staff:
        return 'Staff Member';
      case AccountRole.Lecturer:
        return 'Lecturer';
      default:
        return 'Staff Member';
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="flex-1 bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center p-8">
          <div className="max-w-md text-center text-white">
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="text-3xl text-white">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
                  </svg>
                </div>
                <h1 className="text-3xl font-bold">FU News</h1>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Join Our Team</h2>
            <p className="text-green-100 text-lg leading-relaxed">
              Create your account to access the FU News administration system and start managing news content.
            </p>
            <div className="mt-8 space-y-2 text-green-100">
              <p className="text-sm">Account Types:</p>
              <p className="text-xs">• Staff: Manage news articles</p>
              <p className="text-xs">• Lecturer: Create and review content</p>
              <p className="text-xs">• Admin: Full system access</p>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h3>
                <p className="text-slate-600">Fill in your details to get started</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <span className="material-icons text-red-500 text-xl mr-3">error</span>
                      <p className="text-sm text-red-800">{errors.general}</p>
                    </div>
                  </div>
                )}

                {/* Full Name Field */}
                <div>
                  <label htmlFor="accountName" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="accountName"
                      type="text"
                      value={form.accountName}
                      onChange={handleInputChange('accountName')}
                      placeholder="Enter your full name"
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.accountName ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                      required
                      autoComplete="name"
                      autoFocus
                    />
                    <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">person</span>
                  </div>
                  {errors.accountName && (
                    <p className="mt-2 text-sm text-red-600">{errors.accountName}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="accountEmail" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="accountEmail"
                      type="email"
                      value={form.accountEmail}
                      onChange={handleInputChange('accountEmail')}
                      placeholder="Enter your email"
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.accountEmail ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                      required
                      autoComplete="email"
                    />
                    <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">email</span>
                  </div>
                  {errors.accountEmail && (
                    <p className="mt-2 text-sm text-red-600">{errors.accountEmail}</p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="accountRole" className="block text-sm font-medium text-slate-700 mb-2">
                    Account Type
                  </label>
                  <div className="relative">
                    <select
                      id="accountRole"
                      value={form.accountRole}
                      onChange={handleInputChange('accountRole')}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none ${
                        errors.accountRole ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                      required
                    >
                      <option value={AccountRole.Staff}>{getRoleDisplayName(AccountRole.Staff)}</option>
                      <option value={AccountRole.Lecturer}>{getRoleDisplayName(AccountRole.Lecturer)}</option>
                      <option value={AccountRole.Admin}>{getRoleDisplayName(AccountRole.Admin)}</option>
                    </select>
                    <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">badge</span>
                    <span className="material-icons absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">expand_more</span>
                  </div>
                  {errors.accountRole && (
                    <p className="mt-2 text-sm text-red-600">{errors.accountRole}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="accountPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="accountPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={form.accountPassword}
                      onChange={handleInputChange('accountPassword')}
                      placeholder="Create a strong password"
                      className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.accountPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                      required
                      autoComplete="new-password"
                    />
                    <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">lock</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className="material-icons text-xl">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.accountPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.accountPassword}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      placeholder="Confirm your password"
                      className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                      required
                      autoComplete="new-password"
                    />
                    <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">lock</span>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className="material-icons text-xl">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div>
                  <div className="flex items-start">
                    <input
                      id="agreeToTerms"
                      type="checkbox"
                      checked={form.agreeToTerms}
                      onChange={handleInputChange('agreeToTerms')}
                      className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500 mt-1"
                    />
                    <label htmlFor="agreeToTerms" className="ml-3 text-sm text-slate-600">
                      I agree to the{' '}
                      <Link href="/terms" className="text-green-600 hover:text-green-700 underline">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-green-600 hover:text-green-700 underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="mt-2 text-sm text-red-600">{errors.agreeToTerms}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>

              {/* Back to Home */}
              <div className="mt-6 text-center">
                <Link 
                  href="/"
                  className="inline-flex items-center text-sm text-slate-600 hover:text-green-600 transition-colors"
                >
                  <span className="material-icons text-lg mr-1">arrow_back</span>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 