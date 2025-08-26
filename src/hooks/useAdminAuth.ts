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
    // Check if admin is already logged in from localStorage and cookies
    const isAdmin = localStorage.getItem('isAdmin');
    const adminEmail = localStorage.getItem('adminEmail');
    const token = localStorage.getItem('authToken');
    
    // Also check cookies for consistency with regular auth
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const cookieToken = getCookie('authToken');
    const cookieIsAdmin = getCookie('isAdmin');
    
    // Check both localStorage and cookies for admin status
    if ((isAdmin === 'true' && adminEmail && token) || (cookieIsAdmin === 'true' && cookieToken)) {
      // Admin is logged in, restore the state
      const adminUser: AdminUser = {
        id: 'admin',
        email: adminEmail || 'admin@justhear.com',
        role: 'admin',
        permissions: ['manage_slots', 'manage_listeners', 'view_analytics', 'manage_schedules'],
      };
      setAdminUser(adminUser);
    }
    
    // Set loading to false after a small delay to prevent race conditions
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  const loginAsAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Admin login attempt:', { email });
      
      const response = await fetch('https://justhear-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log('Admin login response:', { 
        status: response.status, 
        ok: response.ok,
        data,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok && data.user && data.user.role === 'admin') {
        const adminUser: AdminUser = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          permissions: ['manage_slots', 'manage_listeners', 'view_analytics', 'manage_schedules'],
        };
        setAdminUser(adminUser);
        
        // Store in both localStorage and cookies for consistency
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('authToken', data.token);
        
        // Also set cookies to match regular auth system
        document.cookie = `isAdmin=true; path=/; max-age=86400`; // 24 hours
        document.cookie = `authToken=${data.token}; path=/; max-age=86400`; // 24 hours
        
        console.log('Admin login successful:', adminUser);
        return true;
      } else {
        console.log('Admin login failed - response details:', {
          responseOk: response.ok,
          hasUser: !!data.user,
          userRole: data.user?.role,
          expectedRole: 'admin',
          fullData: data
        });
      }
      
      console.log('Admin login failed:', data);
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('authToken');
    
    // Also clear cookies for consistency
    document.cookie = 'isAdmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
