const API_BASE_URL = 'https://justhear-backend.onrender.com/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        status: 500 
      };
    }
  }

  // Health check
  async getHealth() {
    return this.request('health');
  }

  // Users
  async getUsers() {
    return this.request('users');
  }

  async getUser(_id: number) {
    return this.request(`users`);
  }

  // Slots
  async getSlots() {
    return this.request('slots');
  }

  async getSlot(_id: number) {
    return this.request('slots');
  }

  // Bookings
  async getBookings() {
    return this.request('bookings');
  }

  async getBooking(_id: number) {
    return this.request('bookings');
  }

  async getUserBookings(userId: string) {
    return this.request(`bookings/user/${userId}`);
  }

  async getUserReviews(userId: string) {
    return this.request(`reviews/user/${userId}`);
  }

  async getUserStats(userId: string) {
    return this.request(`users/${userId}/stats`);
  }

  getBaseUrl() {
    return API_BASE_URL;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { 
          error: data.error || `Login failed (${response.status})`, 
          status: response.status 
        };
      }

      return { data, status: response.status };
    } catch (error) {
      console.error('Login request failed:', error);
      return { 
        error: 'Network error. Please try again.', 
        status: 500 
      };
    }
  }

  async signup(username: string, email: string, password: string, role: string = 'user') {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { 
          error: data.error || `Signup failed (${response.status})`, 
          status: response.status 
        };
      }

      return { data, status: response.status };
    } catch (error) {
      console.error('Signup request failed:', error);
      return { 
        error: 'Network error. Please try again.', 
        status: 500 
      };
    }
  }
}

export const apiService = new ApiService();
