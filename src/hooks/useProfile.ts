'use client';

import { useAuth } from '@/context/AuthContext';
import { accountService } from '@/lib/api-services';
import { ChangePasswordDto, SystemAccount, UpdateProfileDto } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export function useProfile() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [profile, setProfile] = useState<SystemAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const profileData = await accountService.getProfile();
      setProfile(profileData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  // Update profile
  const updateProfile = useCallback(async (data: UpdateProfileDto): Promise<SystemAccount> => {
    try {
      setError(null);
      const updatedProfile = await accountService.updateProfile(data);
      setProfile(updatedProfile);
      
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (data: ChangePasswordDto): Promise<void> => {
    try {
      setError(null);
      await accountService.changePassword(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Retry loading profile
  const retry = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load profile on mount and when authentication changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    changePassword,
    retry,
    clearError,
    isAuthenticated
  };
}

export type UseProfileReturn = ReturnType<typeof useProfile>; 