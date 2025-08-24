import type { ApiResponse, PaginatedResponse, User, BookingSession } from '@/types';
import { config } from '@/config/environment';

class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Authentication endpoints
  async login(username: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async signup(username: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/me');
  }

  // Booking endpoints
  async getAvailableSlots(date: string): Promise<ApiResponse<string[]>> {
    return this.request(`/booking/slots?date=${date}`);
  }

  async createBooking(
    date: string,
    timeSlot: string,
    userId: string
  ): Promise<ApiResponse<BookingSession>> {
    return this.request('/booking/create', {
      method: 'POST',
      body: JSON.stringify({ date, timeSlot, userId }),
    });
  }

  async getUserBookings(userId: string): Promise<ApiResponse<BookingSession[]>> {
    return this.request(`/booking/user/${userId}`);
  }

  async cancelBooking(bookingId: string): Promise<ApiResponse<void>> {
    return this.request(`/booking/${bookingId}/cancel`, {
      method: 'POST',
    });
  }

  // User endpoints
  async updateUserProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<ApiResponse<User>> {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Content endpoints
  async getTestimonials(): Promise<ApiResponse<any[]>> {
    return this.request('/content/testimonials');
  }

  async getFeatures(): Promise<ApiResponse<any[]>> {
    return this.request('/content/features');
  }

  async getFAQ(): Promise<ApiResponse<any[]>> {
    return this.request('/content/faq');
  }

  // Analytics endpoints
  async trackEvent(event: string, properties?: Record<string, any>): Promise<ApiResponse<void>> {
    return this.request('/analytics/event', {
      method: 'POST',
      body: JSON.stringify({ event, properties }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export individual methods for convenience
export const {
  login,
  signup,
  logout,
  getCurrentUser,
  getAvailableSlots,
  createBooking,
  getUserBookings,
  cancelBooking,
  updateUserProfile,
  deleteUser,
  getTestimonials,
  getFeatures,
  getFAQ,
  trackEvent,
  healthCheck,
} = apiService;
