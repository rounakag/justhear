import React from 'react';
import { SlotManager } from '@/components/admin/SlotManager';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminPageProps {
  onLogout?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onLogout }) => {
  const { adminUser, logoutAdmin } = useAdminAuth();

  const handleLogout = () => {
    logoutAdmin();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            {adminUser && (
              <span className="text-sm text-gray-600">
                Logged in as: {adminUser.email}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Logout Admin
          </button>
        </div>
      </div>
      
      <SlotManager />
    </div>
  );
};
