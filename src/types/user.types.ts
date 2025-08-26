export interface UserBooking {
  id: string;
  slotId: string;
  userId: string;
  listenerId: string;
  listenerName: string;
  listenerAvatar?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  price: number;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  transactionId: string;
  meetingLink?: string;
  meetingId?: string;
  meetingProvider?: string;
}

export interface UserReview {
  id: string;
  bookingId: string;
  userId: string;
  listenerId: string;
  rating: number; // 1-5 stars
  review: string;
  createdAt: string;
  updatedAt: string;
  isAnonymous: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  timezone: string;
  preferences: {
    notificationEmail: boolean;
    notificationSMS: boolean;
    anonymousReviews: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserDashboardStats {
  totalBookings: number;
  completedSessions: number;
  upcomingSessions: number;
  totalSpent: number;
  averageRating: number;
  totalReviews: number;
}

export interface UserSession {
  booking: UserBooking;
  review?: UserReview;
  canReview: boolean;
  canCancel: boolean;
  timeUntilSession?: number; // in minutes
}
