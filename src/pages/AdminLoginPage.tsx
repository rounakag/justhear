import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, loginAsAdmin } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Add debugging
  useEffect(() => {
    console.log('🔄 AdminLoginPage mounted');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 isAdmin state:', isAdmin);
    
    // Collect debug information
    const debug = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString(),
      localStorage: {
        isAdmin: localStorage.getItem('isAdmin'),
        adminEmail: localStorage.getItem('adminEmail'),
        authToken: localStorage.getItem('authToken'),
      },
      cookies: document.cookie,
      pathname: window.location.pathname,
      search: window.location.search,
    };
    
    setDebugInfo(debug);
    console.log('🔍 Debug info:', debug);
    
    // Force cache refresh
    if ('caches' in window) {
      caches.keys().then(names => {
        console.log('🗑️ Clearing caches:', names);
        names.forEach(name => caches.delete(name));
      });
    }
  }, []);

  // Redirect to admin dashboard if already logged in
  useEffect(() => {
    console.log('Admin login page - isAdmin state:', isAdmin);
    if (isAdmin) {
      console.log('Admin already logged in, redirecting to dashboard...');
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Submitting admin login form...');
      const success = await loginAsAdmin(email, password);
      console.log('Login result:', success);
      
      if (success) {
        console.log('Login successful, navigating to dashboard...');
        navigate('/admin/dashboard');
      } else {
        console.log('Login failed, showing error...');
        setError('Invalid admin credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add default admin credentials for testing
  const handleQuickLogin = async () => {
    setEmail('admin2@justhear.com');
    setPassword('admin123');
    
    // Auto-submit after setting credentials
    setTimeout(async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Quick login attempt...');
        const success = await loginAsAdmin('admin2@justhear.com', 'admin123');
        console.log('Quick login result:', success);
        
        if (success) {
          console.log('Quick login successful, navigating to dashboard...');
          navigate('/admin/dashboard');
        } else {
          console.log('Quick login failed, showing error...');
          setError('Quick login failed. Please try manual login.');
        }
      } catch (err) {
        console.error('Quick login error:', err);
        setError('Quick login failed. Please try manual login.');
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  const handleForceRefresh = () => {
    console.log('🔄 Force refreshing page...');
    window.location.reload();
  };

  const handleClearCache = () => {
    console.log('🧹 Clearing all cache...');
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Clear caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    console.log('✅ Cache cleared, refreshing...');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Admin Access</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Debug Information */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>URL: {debugInfo.url}</p>
              <p>Screen: {debugInfo.screenSize}</p>
              <p>Time: {debugInfo.timestamp}</p>
              <p>isAdmin: {debugInfo.localStorage?.isAdmin}</p>
            </div>
          </div>

          {/* Cache Control Buttons */}
          <div className="mb-6 space-y-2">
            <button
              type="button"
              onClick={handleForceRefresh}
              className="w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              🔄 Force Refresh Page
            </button>
            <button
              type="button"
              onClick={handleClearCache}
              className="w-full text-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
            >
              🧹 Clear All Cache & Refresh
            </button>
          </div>

          {/* Quick Login Button for Testing */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Quick Login (Test)'}
            </button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              Uses default admin credentials for testing
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 text-center mb-4">Or login manually:</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="admin2@justhear.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Admin Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Login Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Default Credentials</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Email: admin2@justhear.com<br />
                Password: admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
