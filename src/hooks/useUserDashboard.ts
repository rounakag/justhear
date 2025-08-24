import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/userService';
import type { 
  UserSession, 
  UserProfile, 
  UserDashboardStats, 
  UserReview 
} from '@/types/user.types';

interface UseUserDashboardReturn {
  // State
  sessions: UserSession[];
  profile: UserProfile | null;
  stats: UserDashboardStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  createReview: (reviewData: Omit<UserReview, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReview: (reviewId: string, reviewData: Partial<UserReview>) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  
  // Computed
  upcomingSessions: UserSession[];
  completedSessions: UserSession[];
  sessionsNeedingReview: UserSession[];
}

export function useUserDashboard(): UseUserDashboardReturn {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [sessionsData, profileData, statsData] = await Promise.all([
        userService.getUserSessions(),
        userService.getUserProfile(),
        userService.getDashboardStats(),
      ]);
      
      setSessions(sessionsData);
      setProfile(profileData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      await userService.cancelBooking(bookingId);
      await refreshData(); // Refresh to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      throw err;
    }
  }, [refreshData]);

  const createReview = useCallback(async (reviewData: Omit<UserReview, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await userService.createReview(reviewData);
      await refreshData(); // Refresh to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create review');
      throw err;
    }
  }, [refreshData]);

  const updateReview = useCallback(async (reviewId: string, reviewData: Partial<UserReview>) => {
    try {
      await userService.updateReview(reviewId, reviewData);
      await refreshData(); // Refresh to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
      throw err;
    }
  }, [refreshData]);

  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      await userService.deleteReview(reviewId);
      await refreshData(); // Refresh to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
      throw err;
    }
  }, [refreshData]);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    try {
      const updatedProfile = await userService.updateUserProfile(profileData);
      setProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Computed values
  const upcomingSessions = sessions.filter(session => session.booking.status === 'upcoming');
  const completedSessions = sessions.filter(session => session.booking.status === 'completed');
  const sessionsNeedingReview = sessions.filter(session => session.canReview);

  return {
    // State
    sessions,
    profile,
    stats,
    loading,
    error,
    
    // Actions
    refreshData,
    cancelBooking,
    createReview,
    updateReview,
    deleteReview,
    updateProfile,
    
    // Computed
    upcomingSessions,
    completedSessions,
    sessionsNeedingReview,
  };
}
