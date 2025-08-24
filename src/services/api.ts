import { config } from '@/config/environment';

// API Base URL
const API_BASE_URL = config.api.baseUrl || 'http://localhost:5000';

// Request timeout
const REQUEST_TIMEOUT = 30000;

// Custom fetch with timeout and error handling
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
    throw new Error('Network error');
  }
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Add auth header to requests
function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// API Response types
interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}



// Generic API client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetchWithTimeout(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return response.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return response.json();
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return response.json();
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return response.json();
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  // User registration
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    return apiClient.post<{ user: any; token: string }>('/api/auth/register', userData);
  },

  // User login
  login: async (credentials: { email: string; password: string }) => {
    return apiClient.post<{ user: any; token: string }>('/api/auth/login', credentials);
  },

  // Admin login
  adminLogin: async (credentials: { email: string; password: string }) => {
    return apiClient.post<{ admin: any; token: string }>('/api/auth/admin/login', credentials);
  },

  // Logout
  logout: async () => {
    return apiClient.post('/api/auth/logout');
  },

  // Refresh token
  refreshToken: async () => {
    return apiClient.post<{ token: string }>('/api/auth/refresh');
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    return apiClient.post('/api/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    return apiClient.post('/api/auth/reset-password', { token, password });
  },
};

// Users API
export const usersApi = {
  // Get user profile
  getProfile: async () => {
    return apiClient.get<any>('/api/users/profile');
  },

  // Update user profile
  updateProfile: async (profileData: Partial<any>) => {
    return apiClient.put<any>('/api/users/profile', profileData);
  },

  // Get user dashboard stats
  getDashboardStats: async () => {
    return apiClient.get<any>('/api/users/dashboard/stats');
  },

  // Get user sessions
  getSessions: async (params?: { page?: number; limit?: number; status?: string }) => {
    return apiClient.get<ApiResponse<any[]>>('/api/users/sessions', params);
  },
};

// Bookings API
export const bookingsApi = {
  // Get all bookings
  getBookings: async (params?: { page?: number; limit?: number; status?: string; listener_id?: string }) => {
    return apiClient.get<ApiResponse<any[]>>('/api/bookings', params);
  },

  // Get booking by ID
  getBooking: async (bookingId: string) => {
    return apiClient.get<any>(`/api/bookings/${bookingId}`);
  },

  // Create new booking
  createBooking: async (bookingData: {
    listener_id: string;
    slot_id: string;
    date: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }) => {
    return apiClient.post<{ booking: any; meeting_link: any; payment_intent: any }>('/api/bookings', bookingData);
  },

  // Update booking
  updateBooking: async (bookingId: string, updates: Partial<any>) => {
    return apiClient.put<any>(`/api/bookings/${bookingId}`, updates);
  },

  // Cancel booking
  cancelBooking: async (bookingId: string) => {
    return apiClient.delete(`/api/bookings/${bookingId}`);
  },

  // Get meeting link
  getMeetingLink: async (bookingId: string) => {
    return apiClient.get<any>(`/api/bookings/${bookingId}/meeting-link`);
  },

  // Generate meeting link
  generateMeetingLink: async (bookingId: string, options?: { provider?: string; meeting_type?: string }) => {
    return apiClient.post<any>(`/api/bookings/${bookingId}/meeting-link`, options);
  },

  // Join session
  joinSession: async (bookingId: string) => {
    return apiClient.post<{ meeting_url: string; meeting_password?: string; provider: string }>(`/api/bookings/${bookingId}/join`);
  },
};

// Listeners API
export const listenersApi = {
  // Get all listeners
  getListeners: async (params?: { page?: number; limit?: number; specialization?: string }) => {
    return apiClient.get<ApiResponse<any[]>>('/api/listeners', params);
  },

  // Get listener by ID
  getListener: async (listenerId: string) => {
    return apiClient.get<any>(`/api/listeners/${listenerId}`);
  },

  // Get listener availability
  getAvailability: async (listenerId: string, date: string) => {
    return apiClient.get<any[]>(`/api/listeners/${listenerId}/availability`, { date });
  },

  // Get listener reviews
  getReviews: async (listenerId: string, params?: { page?: number; limit?: number }) => {
    return apiClient.get<ApiResponse<any[]>>(`/api/listeners/${listenerId}/reviews`, params);
  },
};

// Reviews API
export const reviewsApi = {
  // Get user reviews
  getUserReviews: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get<ApiResponse<any[]>>('/api/reviews', params);
  },

  // Create review
  createReview: async (reviewData: {
    booking_id: string;
    rating: number;
    review_text: string;
    is_anonymous?: boolean;
  }) => {
    return apiClient.post<any>('/api/reviews', reviewData);
  },

  // Update review
  updateReview: async (reviewId: string, updates: Partial<any>) => {
    return apiClient.put<any>(`/api/reviews/${reviewId}`, updates);
  },

  // Delete review
  deleteReview: async (reviewId: string) => {
    return apiClient.delete(`/api/reviews/${reviewId}`);
  },
};

// Payments API
export const paymentsApi = {
  // Create payment intent
  createPaymentIntent: async (paymentData: {
    booking_id: string;
    amount: number;
    currency?: string;
  }) => {
    return apiClient.post<any>('/api/payments/create-intent', paymentData);
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId: string) => {
    return apiClient.post<any>('/api/payments/confirm', { payment_intent_id: paymentIntentId });
  },

  // Get payment history
  getPaymentHistory: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get<ApiResponse<any[]>>('/api/payments/history', params);
  },

  // Request refund
  requestRefund: async (paymentId: string, reason: string) => {
    return apiClient.post<any>(`/api/payments/${paymentId}/refund`, { reason });
  },
};

// Admin API
export const adminApi = {
  // Get admin dashboard stats
  getDashboardStats: async () => {
    return apiClient.get<any>('/api/admin/dashboard/stats');
  },

  // Get all bookings (admin)
  getAllBookings: async (params?: { page?: number; limit?: number; status?: string; user_id?: string; listener_id?: string }) => {
    return apiClient.get<ApiResponse<any[]>>('/api/admin/bookings', params);
  },

  // Get all users (admin)
  getAllUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    return apiClient.get<ApiResponse<any[]>>('/api/admin/users', params);
  },

  // Get all listeners (admin)
  getAllListeners: async (params?: { page?: number; limit?: number; search?: string }) => {
    return apiClient.get<ApiResponse<any[]>>('/api/admin/listeners', params);
  },

  // Create time slot
  createTimeSlot: async (slotData: {
    listener_id: string;
    date: string;
    start_time: string;
    end_time: string;
    is_recurring?: boolean;
    recurring_pattern?: any;
  }) => {
    return apiClient.post<any>('/api/admin/time-slots', slotData);
  },

  // Bulk create time slots
  bulkCreateTimeSlots: async (slotsData: {
    listener_id: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    days_of_week: number[];
    is_recurring: boolean;
  }) => {
    return apiClient.post<any[]>('/api/admin/time-slots/bulk', slotsData);
  },

  // Update time slot
  updateTimeSlot: async (slotId: string, updates: Partial<any>) => {
    return apiClient.put<any>(`/api/admin/time-slots/${slotId}`, updates);
  },

  // Delete time slot
  deleteTimeSlot: async (slotId: string) => {
    return apiClient.delete(`/api/admin/time-slots/${slotId}`);
  },
};

// Notifications API
export const notificationsApi = {
  // Get user notifications
  getNotifications: async (params?: { page?: number; limit?: number; is_read?: boolean }) => {
    return apiClient.get<ApiResponse<any[]>>('/api/notifications', params);
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    return apiClient.patch<any>(`/api/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return apiClient.patch<any>('/api/notifications/mark-all-read');
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    return apiClient.delete(`/api/notifications/${notificationId}`);
  },
};

// Health check
export const healthApi = {
  check: async () => {
    return apiClient.get<{ status: string; timestamp: string; environment: string; version: string }>('/health');
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  users: usersApi,
  bookings: bookingsApi,
  listeners: listenersApi,
  reviews: reviewsApi,
  payments: paymentsApi,
  admin: adminApi,
  notifications: notificationsApi,
  health: healthApi,
};

// Error handling utility
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request interceptor for handling auth errors
export const handleApiError = (error: any): never => {
  if (error.message === 'Unauthorized' || error.status === 401) {
    // Clear auth token and redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  
  throw new ApiError(error.message, error.status, error.errors);
};

export default api;
