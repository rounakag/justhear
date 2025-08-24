import { useState, useCallback } from 'react';
import type { AppError, AppEvent } from '@/types';

interface AppState {
  isLoading: boolean;
  error: AppError | null;
  events: AppEvent[];
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

interface UseAppStateReturn extends AppState {
  setLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
  addEvent: (event: Omit<AppEvent, 'timestamp'>) => void;
  clearError: () => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  clearEvents: () => void;
}

export const useAppState = (): UseAppStateReturn => {
  const [state, setState] = useState<AppState>({
    isLoading: false,
    error: null,
    events: [],
    theme: 'light',
    sidebarOpen: false,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: AppError | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const addEvent = useCallback((event: Omit<AppEvent, 'timestamp'>) => {
    const newEvent: AppEvent = {
      ...event,
      timestamp: new Date(),
    };
    setState(prev => ({
      ...prev,
      events: [...prev.events, newEvent].slice(-100), // Keep last 100 events
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, sidebarOpen: open }));
  }, []);

  const clearEvents = useCallback(() => {
    setState(prev => ({ ...prev, events: [] }));
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    addEvent,
    clearError,
    toggleTheme,
    setSidebarOpen,
    clearEvents,
  };
};
