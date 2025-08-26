import React, { useState, useEffect, createContext, useContext } from 'react';
import { apiService } from '@/services/api';

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'listener' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string, role?: string) => Promise<boolean>;
  signUp: (username: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  clearStorage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getCookie('authToken') || localStorage.getItem('authToken');
    const savedUser = getCookie('user') || localStorage.getItem('user');
    
    console.log('AuthProvider: Checking session:', { hasToken: !!token, hasUser: !!savedUser });
    
    if (token && savedUser) {
      try {
        const parsedUser = typeof savedUser === 'string' ? JSON.parse(savedUser) : savedUser;
        // Only restore if it's a valid user and not a test user
        if (parsedUser.username && !parsedUser.username.includes('rounak338')) {
          console.log('AuthProvider: Found saved user:', parsedUser.username);
          setUser(parsedUser);
          
          // Ensure token is in both cookie and localStorage for redundancy
          if (!getCookie('authToken')) {
            setCookie('authToken', token, 30);
          }
          if (!getCookie('user')) {
            setCookie('user', JSON.stringify(parsedUser), 30);
          }
        } else {
          console.log('AuthProvider: Clearing invalid user data');
          clearSession();
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        clearSession();
      }
    }
    
    setLoading(false);
  }, []);

  const clearSession = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    deleteCookie('authToken');
    deleteCookie('user');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.login(email, password);
      
      if (response.data && response.status === 200) {
        const { user, token } = response.data;
        setUser(user as User);
        
        // Store in both localStorage and cookies for redundancy
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCookie('authToken', token, 30);
        setCookie('user', JSON.stringify(user), 30);
        
        return true;
      } else {
        const errorMessage = response.error || 'Login failed. Please check your credentials.';
        setError(errorMessage);
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string, role: string = 'user'): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.signup(username, email, password, role);
      
      if (response.data && (response.status === 201 || response.status === 200)) {
        const { user, token } = response.data;
        setUser(user as User);
        
        // Store in both localStorage and cookies for redundancy
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCookie('authToken', token, 30);
        setCookie('user', JSON.stringify(user), 30);
        
        return true;
      } else {
        const errorMessage = response.error || 'Signup failed. Please try again.';
        setError(errorMessage);
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearSession();
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminEmail');
  };

  const clearStorage = () => {
    clearSession();
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminEmail');
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    signUp: signup,
    logout,
    clearStorage,
    clearError,
    isAuthenticated: !!user,
    isLoading: loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
