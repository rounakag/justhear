import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import type { 
  TimeSlot, 
  SlotFilters, 
  SlotEditorData, 
  BulkSlotCreation,
  Listener,
  RecurringSchedule,
  AdminStats 
} from '@/types/admin.types';

interface UseAdminSlotsState {
  slots: TimeSlot[];
  listeners: Listener[];
  schedules: RecurringSchedule[];
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  filters: SlotFilters;
}

interface UseAdminSlotsReturn extends UseAdminSlotsState {
  // Slot operations
  createSlot: (data: SlotEditorData) => Promise<void>;
  updateSlot: (id: string, data: Partial<SlotEditorData>) => Promise<void>;
  deleteSlot: (id: string) => Promise<void>;
  createBulkSlots: (data: BulkSlotCreation) => Promise<void>;
  
  // Listener operations
  createListener: (data: Partial<Listener>) => Promise<void>;
  updateListener: (id: string, data: Partial<Listener>) => Promise<void>;
  deleteListener: (id: string) => Promise<void>;
  
  // Schedule operations
  createSchedule: (data: Partial<RecurringSchedule>) => Promise<void>;
  updateSchedule: (id: string, data: Partial<RecurringSchedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  
  // Utility functions
  setFilters: (filters: Partial<SlotFilters>) => void;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export function useAdminSlots(): UseAdminSlotsReturn {
  const [state, setState] = useState<UseAdminSlotsState>({
    slots: [],
    listeners: [],
    schedules: [],
    stats: null,
    loading: false,
    error: null,
    filters: {},
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Add a small delay to prevent shakiness during authentication
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const [slots, listeners, schedules, stats] = await Promise.all([
        adminService.getTimeSlots(state.filters),
        adminService.getListeners(),
        adminService.getRecurringSchedules(),
        adminService.getAdminStats(),
      ]);

      setState(prev => ({
        ...prev,
        slots,
        listeners,
        schedules,
        stats,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    }
  }, [state.filters, setLoading, setError]);

  const setFilters = useCallback((newFilters: Partial<SlotFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
    }));
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Slot operations
  const createSlot = useCallback(async (data: SlotEditorData) => {
    setLoading(true);
    try {
      console.log('Creating slot with data:', data);
      const result = await adminService.createTimeSlot(data);
      console.log('Slot created successfully:', result);
      await fetchData();
    } catch (error) {
      console.error('Failed to create slot:', error);
      setError(error instanceof Error ? error.message : 'Failed to create slot');
      throw error; // Re-throw to show error in UI
    } finally {
      setLoading(false);
    }
  }, [fetchData, setLoading, setError]);

  const updateSlot = useCallback(async (id: string, data: Partial<SlotEditorData>) => {
    setLoading(true);
    try {
      await adminService.updateTimeSlot(id, data);
      await fetchData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update slot');
    }
  }, [fetchData, setLoading, setError]);

  const deleteSlot = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await adminService.deleteTimeSlot(id);
      await fetchData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete slot');
    }
  }, [fetchData, setLoading, setError]);

  const createBulkSlots = useCallback(async (data: BulkSlotCreation) => {
    setLoading(true);
    try {
      await adminService.createBulkSlots(data);
      await fetchData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create bulk slots');
    }
  }, [fetchData, setLoading, setError]);

  // Listener operations
  const createListener = useCallback(async (data: Partial<Listener>) => {
    setLoading(true);
    try {
      await adminService.createListener(data);
      await fetchData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create listener');
    }
  }, [fetchData, setLoading, setError]);

  const updateListener = useCallback(async (id: string, data: Partial<Listener>) => {
    setLoading(true);
    try {
      await adminService.updateListener(id, data);
      await fetchData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update listener');
    }
  }, [fetchData, setLoading, setError]);

  const deleteListener = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await adminService.deleteListener(id);
      await fetchData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete listener');
    }
  }, [fetchData, setLoading, setError]);

  // Schedule operations
  const createSchedule = useCallback(async (data: Partial<RecurringSchedule>) => {
    setLoading(true);
    try {
      await adminService.createRecurringSchedule(data);
      await fetchData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create schedule');
    }
  }, [fetchData, setLoading, setError]);

  const updateSchedule = useCallback(async (id: string, data: Partial<RecurringSchedule>) => {
    setLoading(true);
    try {
      await adminService.updateRecurringSchedule(id, data);
      await fetchData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update schedule');
    }
  }, [fetchData, setLoading, setError]);

  const deleteSchedule = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await adminService.deleteRecurringSchedule(id);
      await fetchData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete schedule');
    }
  }, [fetchData, setLoading, setError]);

  // Initial data fetch with delay to prevent shakiness
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300); // Delay to ensure authentication is stable
    
    return () => clearTimeout(timer);
  }, [fetchData]);

  return {
    ...state,
    createSlot,
    updateSlot,
    deleteSlot,
    createBulkSlots,
    createListener,
    updateListener,
    deleteListener,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    setFilters,
    refreshData,
    clearError,
  };
}
