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

  // Admin users will be fetched from backend

  useEffect(() => {
    // Check if admin is already logged in from localStorage
    const isAdmin = localStorage.getItem('isAdmin');
    const adminEmail = localStorage.getItem('adminEmail');
    
    if (isAdmin === 'true' && adminEmail) {
      // Admin user will be fetched from backend on login
      // For now, just check if we have a valid token
      const token = localStorage.getItem('authToken');
      if (token) {
        // Token exists, admin is logged in
        // We'll validate this on actual API calls
      } else {
        // Clear invalid admin data
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminEmail');
      }
    }
    
    // Set loading to false after a small delay to prevent race conditions
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  const loginAsAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('https://justhear-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.user && data.user.role === 'admin') {
        const adminUser: AdminUser = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          permissions: ['manage_slots', 'manage_listeners', 'view_analytics', 'manage_schedules'],
        };
        setAdminUser(adminUser);
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('authToken', data.token);
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
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
