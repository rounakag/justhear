import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlotManager } from '@/components/admin/SlotManager';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { SchedulerModal } from '@/components/SchedulerModal';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, adminUser, logoutAdmin, loading } = useAdminAuth();

  // Redirect to admin login if not authenticated (but only after loading is complete)
  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, loading, navigate]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading if not authenticated (this should only happen briefly)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              {adminUser && (
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-600">
                    Logged in as: <span className="font-medium">{adminUser.email}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Role: {adminUser.role} • Permissions: {adminUser.permissions.join(', ')}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <SchedulerModal>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  🎧 Book New Session
                </button>
              </SchedulerModal>
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ← Back to Main Site
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Logout Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <SlotManager />
    </div>
  );
};
