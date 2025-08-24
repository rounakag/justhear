import type { 
  UserBooking, 
  UserReview, 
  UserProfile, 
  UserDashboardStats,
  UserSession 
} from '@/types/user.types';
import { 
  MOCK_USER_BOOKINGS, 
  MOCK_USER_REVIEWS, 
  MOCK_USER_PROFILE, 
  MOCK_USER_DASHBOARD_STATS 
} from '@/constants/userData';

class UserService {
  private mockData = {
    bookings: [...MOCK_USER_BOOKINGS],
    reviews: [...MOCK_USER_REVIEWS],
    profile: { ...MOCK_USER_PROFILE },
    stats: { ...MOCK_USER_DASHBOARD_STATS },
  };

  // User Profile Management
  async getUserProfile(): Promise<UserProfile> {
    // Mock implementation
    return this.mockData.profile;
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    // Mock implementation
    this.mockData.profile = { ...this.mockData.profile, ...profileData };
    return this.mockData.profile;
  }

  // Booking Management
  async getUserBookings(): Promise<UserBooking[]> {
    // Mock implementation
    return this.mockData.bookings;
  }

  async getBookingById(bookingId: string): Promise<UserBooking> {
    const booking = this.mockData.bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    return booking;
  }

  async cancelBooking(bookingId: string): Promise<void> {
    const bookingIndex = this.mockData.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) throw new Error('Booking not found');
    
    this.mockData.bookings[bookingIndex] = {
      ...this.mockData.bookings[bookingIndex],
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };
  }

  async rescheduleBooking(bookingId: string, newSlotId: string, newDate: string, newStartTime: string, newEndTime: string): Promise<UserBooking> {
    const bookingIndex = this.mockData.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) throw new Error('Booking not found');
    
    this.mockData.bookings[bookingIndex] = {
      ...this.mockData.bookings[bookingIndex],
      slotId: newSlotId,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      updatedAt: new Date().toISOString(),
    };
    
    return this.mockData.bookings[bookingIndex];
  }

  // Review Management
  async getUserReviews(): Promise<UserReview[]> {
    // Mock implementation
    return this.mockData.reviews;
  }

  async createReview(reviewData: Omit<UserReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserReview> {
    const newReview: UserReview = {
      ...reviewData,
      id: `review-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.mockData.reviews.push(newReview);
    return newReview;
  }

  async updateReview(reviewId: string, reviewData: Partial<UserReview>): Promise<UserReview> {
    const reviewIndex = this.mockData.reviews.findIndex(r => r.id === reviewId);
    if (reviewIndex === -1) throw new Error('Review not found');
    
    this.mockData.reviews[reviewIndex] = {
      ...this.mockData.reviews[reviewIndex],
      ...reviewData,
      updatedAt: new Date().toISOString(),
    };
    
    return this.mockData.reviews[reviewIndex];
  }

  async deleteReview(reviewId: string): Promise<void> {
    const reviewIndex = this.mockData.reviews.findIndex(r => r.id === reviewId);
    if (reviewIndex === -1) throw new Error('Review not found');
    
    this.mockData.reviews.splice(reviewIndex, 1);
  }

  // Dashboard and Stats
  async getDashboardStats(): Promise<UserDashboardStats> {
    // Mock implementation - in real app, this would calculate from actual data
    return this.mockData.stats;
  }

  async getUserSessions(): Promise<UserSession[]> {
    const sessions: UserSession[] = [];
    
    for (const booking of this.mockData.bookings) {
      const review = this.mockData.reviews.find(r => r.bookingId === booking.id);
      const now = new Date();
      const sessionTime = new Date(booking.startTime);
      const timeUntilSession = sessionTime > now ? 
        Math.floor((sessionTime.getTime() - now.getTime()) / (1000 * 60)) : undefined;
      
      sessions.push({
        booking,
        review,
        canReview: booking.status === 'completed' && !review,
        canCancel: booking.status === 'upcoming' && timeUntilSession !== undefined && timeUntilSession > 60, // Can cancel if more than 1 hour away
        timeUntilSession,
      });
    }
    
    return sessions.sort((a, b) => new Date(b.booking.startTime).getTime() - new Date(a.booking.startTime).getTime());
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
