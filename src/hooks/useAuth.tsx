import React, { useState, useEffect, createContext, useContext } from 'react';
import { apiService } from '@/services/api';

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
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    console.log('AuthProvider: Checking localStorage:', { hasToken: !!token, hasUser: !!savedUser });
    
    // Clear any existing data to prevent default login
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Only restore if it's a valid user and not a test user
        if (parsedUser.username && !parsedUser.username.includes('rounak338')) {
          console.log('AuthProvider: Found saved user:', parsedUser.username);
          setUser(parsedUser);
        } else {
          console.log('AuthProvider: Clearing invalid user data');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.login(email, password);
      
      if (response.data && response.status === 200) {
        const { user, token } = response.data;
        setUser(user as User);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
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
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminEmail');
  };

  const clearStorage = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
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
