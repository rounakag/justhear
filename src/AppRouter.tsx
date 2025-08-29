import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserDashboardPage } from './pages/UserDashboardPage';

// Simple Admin Test Component
const AdminTestPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Test Page</h1>
      <p className="text-gray-600 mb-4">
        This is a test page to verify admin routing is working.
      </p>
      <div className="space-y-2">
        <a 
          href="/admin/login" 
          className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to Admin Login
        </a>
        <a 
          href="/" 
          className="block w-full text-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back to Main Site
        </a>
      </div>
    </div>
  </div>
);

// Cache Busting Component
const CacheBuster: React.FC = () => {
  useEffect(() => {
    // Force cache refresh for admin routes
    if (window.location.pathname.startsWith('/admin')) {
      console.log('🔄 Admin route detected - forcing cache refresh');
      
      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Clear localStorage for admin
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('authToken');
      
      // Clear cookies
      document.cookie = 'isAdmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      console.log('🧹 Cache cleared for admin routes');
    }
  }, []);

  return null;
};

export const AppRouter: React.FC = () => {
  useEffect(() => {
    // Add debugging for all routes
    console.log('🚀 AppRouter mounted');
    console.log('📍 Current URL:', window.location.href);
    console.log('🌐 User Agent:', navigator.userAgent);
    console.log('📱 Screen Size:', window.screen.width, 'x', window.screen.height);
    console.log('🕒 Timestamp:', new Date().toISOString());
    
    // Force reload if admin route and cache issues detected
    if (window.location.pathname.startsWith('/admin')) {
      const lastVisit = localStorage.getItem('lastAdminVisit');
      const now = Date.now();
      
      if (lastVisit && (now - parseInt(lastVisit)) < 5000) {
        console.log('⚠️ Potential cache issue detected - forcing reload');
        window.location.reload();
        return;
      }
      
      localStorage.setItem('lastAdminVisit', now.toString());
    }
  }, []);

  return (
    <ErrorBoundary>
      <CacheBuster />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Main App Route */}
            <Route path="/" element={<App />} />
            
            {/* User Dashboard Route */}
            <Route path="/dashboard" element={<UserDashboardPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/test" element={<AdminTestPage />} />
            
            {/* Redirect admin root to login */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            
            {/* Catch all other routes and redirect to main app */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};
