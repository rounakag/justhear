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
      const response = await apiService.login(email, password);
      
      if (response.data && response.status === 200) {
        const { user, token } = response.data;
        setUser(user as User);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        return true;
      } else {
        console.error('Login failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string, role: string = 'user'): Promise<boolean> => {
    try {
      setLoading(true);
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
        console.error('Signup failed:', response.error || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
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
