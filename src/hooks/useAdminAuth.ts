import { useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'listener' | 'user';
  permissions: string[];
}

interface UseAdminAuthReturn {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  loading: boolean;
  loginAsAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  checkAdminPermissions: (permission: string) => boolean;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock admin users - in production, this would come from your backend
  const ADMIN_USERS: AdminUser[] = [
    {
      id: 'admin-1',
      email: 'admin@justhear.com',
      role: 'admin',
      permissions: ['manage_slots', 'manage_listeners', 'view_analytics', 'manage_schedules'],
    },
    {
      id: 'admin-2',
      email: 'manager@justhear.com',
      role: 'admin',
      permissions: ['manage_slots', 'view_analytics'],
    },
  ];

  useEffect(() => {
    // Check if admin is already logged in from localStorage
    const isAdmin = localStorage.getItem('isAdmin');
    const adminEmail = localStorage.getItem('adminEmail');
    
    console.log('useAdminAuth: Checking localStorage:', { isAdmin, adminEmail });
    
    if (isAdmin === 'true' && adminEmail) {
      const adminUser = ADMIN_USERS.find(admin => admin.email === adminEmail);
      console.log('useAdminAuth: Found admin user from localStorage:', adminUser);
      if (adminUser) {
        setAdminUser(adminUser);
      } else {
        // Clear invalid admin data
        console.log('useAdminAuth: Clearing invalid admin data');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminEmail');
      }
    } else {
      console.log('useAdminAuth: No admin data in localStorage');
    }
    
    // Set loading to false after a small delay to prevent race conditions
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  const loginAsAdmin = async (email: string, password: string): Promise<boolean> => {
    console.log('useAdminAuth: loginAsAdmin called with:', { email, password });
    
    // Mock admin login - in production, this would validate against your backend
    const adminUser = ADMIN_USERS.find(admin => admin.email === email);
    console.log('useAdminAuth: found adminUser:', adminUser);
    
    if (adminUser && password === 'JustHearAdmin2024!') { // More secure demo password
      console.log('useAdminAuth: Login successful, setting admin user');
      setAdminUser(adminUser);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminEmail', email);
      return true;
    }
    
    console.log('useAdminAuth: Login failed');
    return false;
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminEmail');
  };

  const checkAdminPermissions = (permission: string): boolean => {
    return adminUser?.permissions.includes(permission) || false;
  };

  return {
    isAdmin: !!adminUser,
    adminUser,
    loading,
    loginAsAdmin,
    logoutAdmin,
    checkAdminPermissions,
  };
}
