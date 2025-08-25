import type { 
  UserBooking, 
  UserReview, 
  UserProfile, 
  UserDashboardStats,
  UserSession 
} from '@/types/user.types';
import { apiService } from './api';

class UserService {

  // User Profile Management
  async getUserProfile(): Promise<UserProfile> {
    // TODO: Implement when profile API is available
    throw new Error('Profile API not implemented yet');
  }

  async updateUserProfile(_profileData: Partial<UserProfile>): Promise<UserProfile> {
    // TODO: Implement when profile API is available
    throw new Error('Profile API not implemented yet');
  }

  // Booking Management
  async getUserBookings(): Promise<UserBooking[]> {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return [];
    }
    
    const userData = JSON.parse(user);
    const response = await apiService.getUserBookings(userData.id);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || [];
  }

  async getBookingById(bookingId: string): Promise<UserBooking> {
    const bookings = await this.getUserBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    return booking;
  }

  async cancelBooking(bookingId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${apiService.getBaseUrl()}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'cancelled' })
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel booking');
    }
  }

  async rescheduleBooking(_bookingId: string, _newSlotId: string, _newDate: string, _newStartTime: string, _newEndTime: string): Promise<UserBooking> {
    // TODO: Implement when reschedule API is available
    throw new Error('Reschedule API not implemented yet');
  }

  // Review Management
  async getUserReviews(): Promise<UserReview[]> {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return [];
    }
    
    const userData = JSON.parse(user);
    const response = await apiService.getUserReviews(userData.id);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || [];
  }

  async createReview(reviewData: Omit<UserReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserReview> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${apiService.getBaseUrl()}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create review');
    }
    
    return response.json();
  }

  async updateReview(reviewId: string, reviewData: Partial<UserReview>): Promise<UserReview> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${apiService.getBaseUrl()}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update review');
    }
    
    return response.json();
  }

  async deleteReview(reviewId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${apiService.getBaseUrl()}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete review');
    }
  }

  // Dashboard and Stats
  async getDashboardStats(): Promise<UserDashboardStats> {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
          return {
      totalBookings: 0,
      completedSessions: 0,
      upcomingSessions: 0,
      totalSpent: 0,
      totalReviews: 0,
      averageRating: 0
    };
    }
    
    const userData = JSON.parse(user);
    const response = await apiService.getUserStats(userData.id);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || {
      totalBookings: 0,
      completedSessions: 0,
      upcomingSessions: 0,
      totalSpent: 0,
      totalReviews: 0,
      averageRating: 0
    };
  }

  async getUserSessions(): Promise<UserSession[]> {
    const bookings = await this.getUserBookings();
    
    return bookings.map(booking => {
      const now = new Date();
      const sessionTime = new Date(booking.startTime);
      const timeUntilSession = sessionTime > now ? 
        Math.floor((sessionTime.getTime() - now.getTime()) / (1000 * 60)) : undefined;
      
      return {
        booking,
        canReview: booking.status === 'completed',
        canCancel: booking.status === 'upcoming' && timeUntilSession !== undefined && timeUntilSession > 60,
        timeUntilSession,
      };
    });
  }

  // Utility Methods
  async getUpcomingSessions(): Promise<UserSession[]> {
    const sessions = await this.getUserSessions();
    return sessions.filter(session => session.booking.status === 'upcoming');
  }

  async getCompletedSessions(): Promise<UserSession[]> {
    const sessions = await this.getUserSessions();
    return sessions.filter(session => session.booking.status === 'completed');
  }

  async getSessionById(sessionId: string): Promise<UserSession> {
    const sessions = await this.getUserSessions();
    const session = sessions.find(s => s.booking.id === sessionId);
    if (!session) throw new Error('Session not found');
    return session;
  }
}

export const userService = new UserService();
