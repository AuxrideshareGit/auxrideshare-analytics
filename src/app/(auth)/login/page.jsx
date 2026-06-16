'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import logoDark from '@/assets/images/logo-aux.webp';
import logoLight from '@/assets/images/logo-aux.webp';
import IconifyIcon from '@/components/client-wrapper/IconifyIcon';
import { loginApi } from '@/utils/api';
import { useAuthContext } from '@/context/useAuthContext';

const Page = () => {
  const router = useRouter();
  const { saveSession, isAuthenticated } = useAuthContext();

  // If already logged in, skip the login page entirely
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const data = await loginApi(username.trim(), password);

      // The API may return the token in different shapes — handle common patterns:
      // { token }, { access }, { access_token }, { key }, or at data root
      const token =
        data?.token ||
        data?.access ||
        data?.access_token ||
        data?.key ||
        (typeof data === 'string' ? data : null);

      const user = data?.user || data?.admin || { username: username.trim() };

      if (!token) {
        throw new Error('Authentication token not received. Please contact support.');
      }

      saveSession(token, user);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen w-full flex justify-center items-center py-16 md:py-10">
        <div className="card md:w-lg w-screen z-10">
          <div className="text-center px-10 py-12">
            {/* Logo */}
            <Link href="/login" className="flex justify-center">
              <Image
                src={logoDark}
                alt="logo dark"
                className="w-[100px] h-[50px] flex dark:hidden"
                width={100}
                height={50}
              />
              <Image
                src={logoLight}
                alt="logo light"
                className="w-[100px] h-[50px] hidden dark:flex"
                width={100}
                height={50}
              />
            </Link>

            {/* Heading */}
            <div className="mt-8 text-center">
              <h4 className="mb-2.5 text-xl font-semibold text-primary">Welcome Back !</h4>
              <p className="text-base text-default-500">Sign in to continue to Auxrideshare.</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mt-6 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                <IconifyIcon icon="solar:danger-circle-linear" className="text-lg shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="text-left w-full mt-8" noValidate>
              {/* Username */}
              <div className="mb-4">
                <label htmlFor="username" className="block font-medium text-default-900 text-sm mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-input"
                  placeholder="Enter username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label htmlFor="password" className="block font-medium text-default-900 text-sm mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-input pe-10"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 end-0 flex items-center px-3 text-default-400 hover:text-default-700 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <IconifyIcon
                      icon={showPassword ? 'solar:eye-closed-linear' : 'solar:eye-linear'}
                      className="text-xl"
                    />
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="form-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <label className="text-default-900 text-sm font-medium" htmlFor="remember-me">
                  Remember Me
                </label>
              </div>

              {/* Submit */}
              <div className="mt-10 text-center">
                <button
                  type="submit"
                  id="login-submit-btn"
                  className="btn bg-primary text-white w-full flex items-center justify-center gap-2 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <IconifyIcon icon="svg-spinners:ring-resize" className="text-lg" />
                      Signing in…
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <svg
            aria-hidden="true"
            className="absolute inset-0 size-full fill-black/2 stroke-black/5 dark:fill-white/2.5 dark:stroke-white/2.5"
          >
            <defs>
              <pattern id="authPattern" width="56" height="56" patternUnits="userSpaceOnUse" x="50%" y="16">
                <path d="M.5 56V.5H72" fill="none"></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth="0" fill="url(#authPattern)"></rect>
          </svg>
        </div>
      </div>
    </>
  );
};

export default Page;