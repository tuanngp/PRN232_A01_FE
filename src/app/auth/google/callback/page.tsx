'use client';

import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/api-services';
import { AccountRole } from '@/types/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { googleLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get the ID token from URL fragments (for implicit flow)
        const urlFragment = window.location.hash.substring(1);
        const params = new URLSearchParams(urlFragment);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setError(`Google authentication failed: ${error}`);
          setIsProcessing(false);
          return;
        }

        if (code) {
          await googleLogin(code);
          
          const currentUser = authService.getCurrentUser();
          
          // Redirect based on role
          if (currentUser?.accountRole === AccountRole.Admin || currentUser?.accountRole === AccountRole.Staff) {
            router.push('/admin');
          } else {
            router.push('/');
          }
        } else if (code) {
          // Authorization code flow - need to exchange code for token
          // This would typically be handled by the backend
          setError('Authorization code flow not implemented. Please use direct ID token flow.');
          setIsProcessing(false);
        } else {
          setError('No authorization code or ID token received from Google');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Google callback error:', error);
        setError(error instanceof Error ? error.message : 'Google login failed');
        setIsProcessing(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, googleLogin, router]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Processing Google Login</h2>
          <p className="text-slate-600">Please wait while we authenticate you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Authentication Failed</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 