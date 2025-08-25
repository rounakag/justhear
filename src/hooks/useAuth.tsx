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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
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
        console.error('Login failed:', errorMessage);
        setError(errorMessage);
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please check your credentials.';
      console.error('Login error:', errorMessage);
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
      console.log('Attempting signup with:', { username, email, role });
      
      const response = await apiService.signup(username, email, password, role);
      console.log('Signup response:', response);
      
      if (response.data && (response.status === 201 || response.status === 200)) {
        const { user, token } = response.data;
        setUser(user as User);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Signup successful:', user);
        return true;
      } else {
        const errorMessage = response.error || 'Signup failed. Please try again.';
        console.error('Signup failed:', errorMessage);
        setError(errorMessage);
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Signup failed. Please try again.';
      console.error('Signup error:', errorMessage);
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
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    signUp: signup,
    logout,
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
