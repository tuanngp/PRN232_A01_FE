"use client";

import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { authService } from "@/lib/api-services";
import { AccountRole, LoginRequest } from "@/types/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

interface LoginForm extends LoginRequest {
  remember: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin } = useAuth();

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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

      const loginData: LoginRequest = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      await login(loginData);

      // Get user info after login to determine redirect
      const currentUser = authService.getCurrentUser();

      // Redirect based on role
      if (
        currentUser?.accountRole === AccountRole.Admin ||
        currentUser?.accountRole === AccountRole.Staff
      ) {
        router.push("/admin");
      } else {
        router.push("/"); // Redirect other users to home
      }
    } catch (error) {
      let errorMessage = "Login failed";

      if (error instanceof ApiError) {
        switch (error.status) {
          case 401:
            errorMessage = "Invalid email or password";
            break;
          case 403:
            errorMessage = "Account is inactive or access denied";
            break;
          case 429:
            errorMessage = "Too many login attempts. Please try again later.";
            break;
          default:
            errorMessage = error.message || "Login failed";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange =
    (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === "remember" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));

      // Clear field error when user starts typing
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleGoogleSuccess = async (credential: string) => {
    try {
      setIsSubmitting(true);
      setErrors({});

      await googleLogin(credential);

      // Get user info after login to determine redirect
      const currentUser = authService.getCurrentUser();

      // Redirect based on role
      if (
        currentUser?.accountRole === AccountRole.Admin ||
        currentUser?.accountRole === AccountRole.Staff
      ) {
        router.push("/admin");
      } else {
        router.push("/"); // Redirect other users to home
      }
    } catch (error) {
      let errorMessage = "Google login failed";

      if (error instanceof ApiError) {
        switch (error.status) {
          case 401:
            errorMessage = "Google account not registered or unauthorized";
            break;
          case 403:
            errorMessage = "Account is inactive or access denied";
            break;
          default:
            errorMessage = error.message || "Google login failed";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = (error: any) => {
    console.error("Google login error:", error);
    setErrors({ general: "Google login failed. Please try again." });
  };

  return (
    <div
      className="bg-slate-50 min-h-screen"
      style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}
    >
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-8">
          <div className="max-w-md text-center text-white">
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="text-3xl text-white">
                  <svg
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
                <h1 className="text-3xl font-bold">FU News</h1>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Welcome Back</h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Access the FU News administration system to manage news,
              categories, and user accounts.
            </p>
            <div className="mt-8 space-y-2 text-blue-100">
              <p className="text-sm">Demo Credentials:</p>
              <p className="text-xs">
                Admin: admin@FUNewsManagementSystem.org / admin123
              </p>
              <p className="text-xs">
                Staff: staff@FUNewsManagementSystem.org / staff123
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Sign In
                </h3>
                <p className="text-slate-600">
                  Enter your credentials to access the admin panel
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <span className="material-icons text-red-500 text-xl mr-3">
                        error
                      </span>
                      <p className="text-sm text-red-800">{errors.general}</p>
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={handleInputChange("email")}
                      placeholder="Enter your email"
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.email
                          ? "border-red-300 bg-red-50"
                          : "border-slate-300"
                      }`}
                      required
                      autoComplete="email"
                      autoFocus
                    />
                    <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">
                      email
                    </span>
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleInputChange("password")}
                      placeholder="Enter your password"
                      className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.password
                          ? "border-red-300 bg-red-50"
                          : "border-slate-300"
                      }`}
                      required
                      autoComplete="current-password"
                    />
                    <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">
                      lock
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className="material-icons text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={form.remember}
                      onChange={handleInputChange("remember")}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="remember"
                      className="ml-2 text-sm text-slate-600"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Login Button */}
                <div id="google-signin-button">
                  <button
                    type="button"
                    onClick={() => {
                      // Fallback to OAuth2 redirect flow
                      const clientId =
                        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
                        "your-google-client-id";
                      const redirectUri = `${window.location.origin}/auth/google/callback`;
                      const scope = "openid email profile";
                      const responseType = "code";
                      const nonce = Math.random().toString(36).substring(2, 15);

                      const authUrl =
                        `https://accounts.google.com/o/oauth2/v2/auth?` +
                        `client_id=${clientId}&` +
                        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                        `scope=${encodeURIComponent(scope)}&` +
                        `response_type=${responseType}&` +
                        `nonce=${nonce}`;

                      window.location.href = authUrl;
                    }}
                    disabled={isSubmitting}
                    className={`
                      w-full flex items-center justify-center gap-3 px-4 py-3 
                      border border-slate-300 rounded-lg hover:bg-slate-50 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      transition-colors font-medium text-slate-700
                      ${
                        isSubmitting
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    `}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </form>

              {/* Back to Home */}
              <div className="mt-8 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <span className="material-icons text-lg mr-1">
                    arrow_back
                  </span>
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
