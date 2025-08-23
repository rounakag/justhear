import { useState, useEffect, createContext, useContext } from 'react';
import Cookies from 'js-cookie';

interface User {
  username: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signUp: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Mock authentication functions - replace with real API calls
const mockUsers = new Map<string, { password: string; id: string }>();

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = Cookies.get('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        Cookies.remove('user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const storedUser = mockUsers.get(username.toLowerCase());
      if (!storedUser || storedUser.password !== password) {
        setError('Invalid username or password');
        return false;
      }

      const userData = { username, id: storedUser.id };
      setUser(userData);
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
      return true;
    } catch (err) {
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));

      if (mockUsers.has(username.toLowerCase())) {
        setError('Username already exists');
        return false;
      }

      const userId = Math.random().toString(36).substr(2, 9);
      mockUsers.set(username.toLowerCase(), { password, id: userId });

      const userData = { username, id: userId };
      setUser(userData);
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
      return true;
    } catch (err) {
      setError('Sign up failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('user');
  };

  return {
    user,
    login,
    signUp,
    logout,
    isLoading,
    error,
  };
}

export { AuthContext };
